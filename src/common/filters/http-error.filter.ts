import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const envelope = this.toEnvelope(exception);

    response.status(envelope.status).json(envelope.body);
  }

  private toEnvelope(exception: unknown): { status: number; body: ErrorEnvelope } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unexpected server error.',
        },
      },
    };
  }

  private fromPrismaError(error: Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return {
        status: HttpStatus.CONFLICT,
        body: {
          error: {
            code: 'UNIQUE_CONSTRAINT',
            message: 'A record with the same unique value already exists.',
            details: error.meta,
          },
        },
      };
    }

    if (error.code === 'P2025') {
      return {
        status: HttpStatus.NOT_FOUND,
        body: {
          error: {
            code: 'NOT_FOUND',
            message: 'Requested record was not found.',
          },
        },
      };
    }

    return {
      status: HttpStatus.BAD_REQUEST,
      body: {
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed.',
          details: { prismaCode: error.code, meta: error.meta },
        },
      },
    };
  }

  private fromHttpException(exception: HttpException) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        status,
        body: {
          error: {
            code: this.codeFromStatus(status),
            message: exceptionResponse,
          },
        },
      };
    }

    const payload = exceptionResponse as Record<string, unknown>;
    const rawMessage = payload.message;
    const validationMessages = Array.isArray(rawMessage) ? rawMessage : undefined;
    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : validationMessages
          ? 'Validation failed.'
          : exception.message;

    return {
      status,
      body: {
        error: {
          code:
            typeof payload.error === 'string'
              ? this.normalizeCode(payload.error)
              : this.codeFromStatus(status),
          message,
          details: payload.details ?? validationMessages,
        },
      },
    };
  }

  private codeFromStatus(status: number) {
    return HttpStatus[status] ?? 'HTTP_ERROR';
  }

  private normalizeCode(value: string) {
    return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  }
}

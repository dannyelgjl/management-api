import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { HttpErrorFilter } from './http-error.filter';

function makeHost() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const host = {
    switchToHttp: jest.fn(() => ({
      getResponse: jest.fn(() => response),
    })),
  };

  return { host: host as never, response };
}

function prismaError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('Prisma error', {
    clientVersion: '6.19.3',
    code,
    meta,
  });
}

describe('HttpErrorFilter', () => {
  const filter = new HttpErrorFilter();

  it('converts string HttpException responses', () => {
    const { host, response } = makeHost();

    filter.catch(new HttpException('Team not found.', HttpStatus.NOT_FOUND), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Team not found.',
      },
    });
  });

  it('falls back to HTTP_ERROR for unknown HTTP status codes', () => {
    const { host, response } = makeHost();

    filter.catch(new HttpException('Unknown status.', 599), host);

    expect(response.status).toHaveBeenCalledWith(599);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'HTTP_ERROR',
        message: 'Unknown status.',
      },
    });
  });

  it('converts object HttpException responses without explicit message', () => {
    const { host, response } = makeHost();

    filter.catch(new BadRequestException({ error: 'Bad Request' }), host);

    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'BAD_REQUEST',
        message: 'Bad Request Exception',
        details: undefined,
      },
    });
  });

  it('converts validation HttpException responses with details', () => {
    const { host, response } = makeHost();

    filter.catch(
      new BadRequestException({
        message: ['title must be longer than or equal to 3 characters'],
        error: 'Bad Request',
      }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'BAD_REQUEST',
        message: 'Validation failed.',
        details: ['title must be longer than or equal to 3 characters'],
      },
    });
  });

  it('uses object HttpException details when provided', () => {
    const { host, response } = makeHost();

    filter.catch(
      new HttpException(
        {
          message: 'One or more teams were not found.',
          details: { teamIds: ['missing'] },
        },
        HttpStatus.BAD_REQUEST,
      ),
      host,
    );

    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'BAD_REQUEST',
        message: 'One or more teams were not found.',
        details: { teamIds: ['missing'] },
      },
    });
  });

  it('converts Prisma unique constraint errors', () => {
    const { host, response } = makeHost();
    const error = prismaError('P2002', { target: ['name'] });

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'UNIQUE_CONSTRAINT',
        message: 'A record with the same unique value already exists.',
        details: { target: ['name'] },
      },
    });
  });

  it('converts Prisma not found errors', () => {
    const { host, response } = makeHost();

    filter.catch(prismaError('P2025'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Requested record was not found.',
      },
    });
  });

  it('converts other Prisma errors as database errors', () => {
    const { host, response } = makeHost();

    filter.catch(prismaError('P2003', { field_name: 'teamId' }), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed.',
        details: {
          prismaCode: 'P2003',
          meta: { field_name: 'teamId' },
        },
      },
    });
  });

  it('converts unknown errors to internal server error', () => {
    const { host, response } = makeHost();

    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected server error.',
      },
    });
  });
});

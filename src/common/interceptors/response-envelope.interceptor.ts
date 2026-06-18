import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((body) => this.wrap(body)));
  }

  private wrap(body: unknown) {
    if (this.hasDataEnvelope(body)) {
      return body;
    }

    return { data: body ?? null };
  }

  private hasDataEnvelope(body: unknown): body is { data: unknown; meta?: unknown } {
    return (
      typeof body === 'object' &&
      body !== null &&
      !Array.isArray(body) &&
      Object.prototype.hasOwnProperty.call(body, 'data')
    );
  }
}

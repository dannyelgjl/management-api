import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { HttpErrorFilter } from './common/filters/http-error.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';

export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  return app;
}

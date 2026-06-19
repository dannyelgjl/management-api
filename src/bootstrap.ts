import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { HttpErrorFilter } from './common/filters/http-error.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';

export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true });
  app.use(helmet({ contentSecurityPolicy: false }));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  configureSwagger(app);

  return app;
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Management API')
    .setDescription(
      'REST API for managing teams and tasks. Responses are wrapped as { data, meta? } and errors as { error: { code, message, details? } }.',
    )
    .setVersion('0.1.0')
    .addTag('Health')
    .addTag('Teams')
    .addTag('Tasks')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

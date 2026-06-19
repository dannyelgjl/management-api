const createDocument = jest.fn(() => ({ openapi: '3.0.0' }));
const setup = jest.fn();

jest.mock('@nestjs/swagger', () => {
  class DocumentBuilder {
    setTitle() {
      return this;
    }

    setDescription() {
      return this;
    }

    setVersion() {
      return this;
    }

    addTag() {
      return this;
    }

    build() {
      return { title: 'Management API' };
    }
  }

  return {
    DocumentBuilder,
    SwaggerModule: {
      createDocument,
      setup,
    },
  };
});

import { HttpErrorFilter } from './common/filters/http-error.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { configureApp } from './bootstrap';

describe('configureApp', () => {
  it('configures global Nest app concerns and Swagger', () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      useGlobalInterceptors: jest.fn(),
    };

    expect(configureApp(app as never)).toBe(app);
    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(app.enableCors).toHaveBeenCalledWith({ origin: true });
    expect(app.use).toHaveBeenCalledWith(expect.any(Function));
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(Object));
    expect(app.useGlobalFilters).toHaveBeenCalledWith(
      expect.any(HttpErrorFilter),
    );
    expect(app.useGlobalInterceptors).toHaveBeenCalledWith(
      expect.any(ResponseEnvelopeInterceptor),
    );
    expect(createDocument).toHaveBeenCalledWith(app, { title: 'Management API' });
    expect(setup).toHaveBeenCalledWith(
      'api/docs',
      app,
      { openapi: '3.0.0' },
      {
        jsonDocumentUrl: 'api/docs-json',
        swaggerOptions: {
          persistAuthorization: true,
        },
      },
    );
  });
});

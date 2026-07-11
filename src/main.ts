import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { environments } from './settings/environments/environments';
import { RpcCustomExceptionFilter } from './shared/errors/exception/GlobalExceptionHandler';

async function bootstrap() {
  const logger: Logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(morgan('dev'));

  // Gateway: solo transforma tipos automáticamente (string→number, etc.).
  // whitelist/forbidNonWhitelisted NO aplican aquí: el gateway es un proxy,
  // la validación de negocio la realiza cada microservicio con sus propias reglas.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // coerción automática de tipos (UUID, number, etc.)
      transformOptions: {
        enableImplicitConversion: true, // convierte query params string → number automáticamente
      },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-api-key',
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('API Gateway Microservices')
    .setBasePath('api')
    .setDescription('API - Clean Architecture with NestJS & TypeScript')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
      description: 'Enter JWT token in the format **Bearer &lt;token>**',
    })
    .addCookieAuth('auth_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'auth_token',
    })
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description:
          'Mobile-app token required for unauthenticated requests to protected public endpoints.',
      },
      'x-api-key',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'API Documentation',
    customCssUrl:
      'https://mariosalazar-styles-swagger-ui.vercel.app/css/swagger-ui.css',
  });

  app.useGlobalFilters(new RpcCustomExceptionFilter());

  app
    .getHttpAdapter()
    .getInstance()
    .get('/favicon.ico', (_, res) => res.status(204).end());
  await app.startAllMicroservices();

  logger.log(`KAFKA BROKER URL: ${environments.KAFKA_BROKER_URL}`);

  if (process.env.NODE_ENV === 'production') {
    app.listen(environments.PORT, '0.0.0.0', () => {
      logger.log(`API RUNNING: http://0.0.0.0:${environments.PORT}`);
    });

    logger.log(
      `🚀🎉 This API Gateway is running on: http://127.0.0.1:${environments.PORT}`,
    );
  }

  if (process.env.NODE_ENV === 'development') {
    app.listen(environments.PORT, '0.0.0.0', () => {
      logger.log('API RUNNING on: http://0.0.0.0:3005');
    });
    logger.log(
      `🚀🎉 This API Gateway is running on: http://127.0.0.1:${environments.PORT} ✅`,
    );
  }
}
void bootstrap();

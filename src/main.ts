import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as passport from 'passport';
import session from 'express-session';
import { TypeormStore } from 'connect-typeorm';
import { DataSource } from 'typeorm';
import { Session as SessionEntity } from './session/entities/session.entity';

const passportMiddleware = (passport as any).default ?? passport;
const bootstrapLogger = new Logger('Bootstrap');

async function bootstrap() {
  const { PORT, COOKIE_SECRET, COOKIE_EXPIRES_IN } = process.env;
  const port = PORT ?? 8000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const dataSource = app.get(DataSource);
  const sessionRepository = dataSource.getRepository(SessionEntity);

  app.setGlobalPrefix('api');
  app.set('trust proxy', 'loopback');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(
    session({
      secret: COOKIE_SECRET!,
      saveUninitialized: false,
      resave: false,
      name: 'CHAT_SESSION_ID',
      cookie: {
        maxAge: Number(COOKIE_EXPIRES_IN ?? 86400000),
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  app.use(passportMiddleware.initialize());
  app.use(passportMiddleware.session());

  await app.listen(port, () => {
    bootstrapLogger.log(`Running on Port ${port}`);
  });
}
bootstrap();

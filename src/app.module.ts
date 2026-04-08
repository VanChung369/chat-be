import { existsSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './users/user.module.js';
import { PeerModule } from './peer/peer.module.js';
import { MailModule } from './mail/mail.module.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const dbSynchronize = process.env.DB_SYNCHRONIZE === 'true';
const dbLogging = process.env.DB_LOGGING === 'true';
const dbSsl = process.env.DB_SSL !== 'false';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: dbSsl ? { rejectUnauthorized: false } : false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/common/migrate/*{.ts,.js}'],
      migrationsRun: true,
      synchronize: dbSynchronize,
      logging: dbLogging,
      autoLoadEntities: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
        }),
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    PeerModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

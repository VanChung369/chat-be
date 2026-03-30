import { existsSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';

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
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

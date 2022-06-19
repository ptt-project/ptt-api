import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { VersionMiddleware } from './utils/middlewares/version.middleware';
import './initialize';
import { AuthModule } from './modules/auth/auth.modules';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: false,
      entities: ['dist/db/entities/**/*{.js,.ts}'],
      migrations: ['dist/db/migrations/**/*{.js,.ts}'],
      subscribers: ['dist/db/subscriber/**/*{.js,.ts}'],
      autoLoadEntities: true,

      logging: ['error', 'info', 'log', 'warn'],
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.LOG_LEVEL === 'debug'
            ? 'debug'
            : process.env.LOG_LEVEL === 'production'
            ? 'info'
            : 'debug',
        redact: {
          paths: ['req.body.password'],
          censor: '********',
        },
        serializers: {
          req(req) {
            req.body = req.raw.body;
            return req;
          },
        },
      },
      exclude: [
        { method: RequestMethod.GET, path: '/api/v1/health' },
        // { method: RequestMethod.GET, path: "/api/v1/notifications" },
        // { method: RequestMethod.GET, path: "/api/v1/notifications/count" },
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(condumer: MiddlewareConsumer) {
    condumer.apply(VersionMiddleware).forRoutes('/');
  }
}

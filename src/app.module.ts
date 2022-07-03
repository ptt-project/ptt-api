import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { LoggerModule } from 'nestjs-pino'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { VersionMiddleware } from './utils/middlewares/version.middleware'
import './initialize'
import { AuthModule } from './modules/auth/auth.modules'
import { MemberModule } from './modules/member/member.modules'
import { MobileModule } from './modules/mobile/mobile.modules'

console.log('__dirname', __dirname)
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(), //setting from ormconfig.ts
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
            req.body = req.raw.body
            return req
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
    MemberModule,
    MobileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(condumer: MiddlewareConsumer) {
    condumer.apply(VersionMiddleware).forRoutes('/')
  }
}

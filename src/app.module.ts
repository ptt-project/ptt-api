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

import { BullModule } from '@nestjs/bull'
import { VersionMiddleware } from './utils/middlewares/version.middleware'
import './initialize'
import { AuthModule } from './modules/auth/auth.modules'
import { MemberModule } from './modules/member/member.modules'
import { MobileModule } from './modules/mobile/mobile.modules'
import { AddressModule } from './modules/address/address.modules'
import { JobModule } from './jobs/job.module'

console.log('__dirname', __dirname)
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(), //setting from ormconfig.ts
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      defaultJobOptions: {
        removeOnComplete: 10000,
      },
    }),
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
            req.headers = undefined
            return req
          },
        },
      },
      exclude: [{ method: RequestMethod.GET, path: '/api/v1/health' }],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    JobModule,
    AuthModule,
    MemberModule,
    MobileModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(condumer: MiddlewareConsumer) {
    condumer.apply(VersionMiddleware).forRoutes('/')
  }
}

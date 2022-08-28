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
import { ConsoleModule } from 'nestjs-console'
import { MailerModule } from '@nestjs-modules/mailer'
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter'

import { VersionMiddleware } from './utils/middlewares/version.middleware'
import './initialize'
import { AuthModule } from './modules/auth/auth.modules'
import { MemberModule } from './modules/member/member.modules'
import { MobileModule } from './modules/mobile/mobile.modules'
import { AddressModule } from './modules/address/address.modules'
import { SellerModule } from './modules/seller/seller.modules'
import { ReviewModule } from './modules/review/review.modules'
import { CategoryModule } from './modules/category/category.modules'
import { AppConsoleModule } from './modules/app-console/app-console.moduel'
import { EmailModule } from './modules/email/email.module'
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(), //setting from ormconfig.ts
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: `smtps://${process.env.SMTP_FROM_EMAIL}:${process.env.STMP_PASSWORD}@${process.env.STMP_HOST}`,
      template: {
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
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
            req.remoteAddress = undefined
            req.remotePort = undefined
            req.url = undefined
            return req
          },
          res(res) {
            res.headers = undefined
            res.remoteAddress = undefined
            res.remotePort = undefined
            res.url = undefined
            return res
          },
        },
      },

      exclude: [{ method: RequestMethod.GET, path: '/api/v1/health' }],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConsoleModule,
    AppConsoleModule,
    AuthModule,
    MemberModule,
    MobileModule,
    AddressModule,
    SellerModule,
    ReviewModule,
    CategoryModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(condumer: MiddlewareConsumer) {
    condumer.apply(VersionMiddleware).forRoutes('/')
  }
}

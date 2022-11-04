import { Module } from '@nestjs/common'
import { EmailService } from '../email/service/email.service'
import { MemberEmailService } from './service/email.service'
import { MemberController } from './member.controller'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'
import { ProductService } from './service/product.service'
import { OrderService } from './service/order.service'
import { LookupService } from '../happy-point/service/lookup.service'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { OtpService } from '../otp/service/otp.service'
import { WalletService } from '../wallet/service/wallet.service'
import { MasterConfigModule } from '../master-config/master-config.module'
import { OtpModule } from '../otp/otp.modules'
import { WalletModule } from '../wallet/wallet.modules'
import { RedisModule } from 'nestjs-redis'

@Module({
  imports: [
    MasterConfigModule,
    OtpModule,
    WalletModule,
    RedisModule.register({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    }),
    // RedisModule.forRootAsync({
    //   useFactory: async (configService: ConfigService) => configService.get('redis'), // or use async method
    //   //useFactory: async (configService: ConfigService) => configService.get('redis'),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [MemberController],
  providers: [
    PasswordService,
    MemberService,
    EmailService,
    ProductService,
    MemberEmailService,
    OrderService, 
    LookupService, 
    HappyPointService, 
    OtpService, 
    WalletService
  ],

  exports: [],
})
export class MemberModule {}

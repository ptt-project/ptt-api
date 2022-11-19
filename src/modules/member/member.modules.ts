import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from '../auth/auth.constants'

import { RelationService } from './service/relation.service'
import { EmailService } from '../email/service/email.service'
import { MemberEmailService } from './service/email.service'
import { MemberController } from './member.controller'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'
import { ProductService } from './service/product.service'
import { OrderService } from './service/order.service'
import { LookupService } from '../happy-point/service/lookup.service'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { MemberService as AddressMemberService } from '../address/service/member.service'
import { OrderService as ShippingOrderService } from '../order/service/order.service'
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
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  controllers: [MemberController],
  providers: [
    PasswordService,
    MemberService,
    EmailService,
    RelationService,
    ProductService,
    MemberEmailService,
    OrderService,
    LookupService,
    HappyPointService,
    OtpService,
    WalletService,
    AddressMemberService,
    ShippingOrderService,
  ],

  exports: [],
})
export class MemberModule {}

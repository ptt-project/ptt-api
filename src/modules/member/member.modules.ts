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
import { OtpService } from '../otp/service/otp.service'
import { WalletService } from '../wallet/service/wallet.service'

@Module({
  imports: [
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
    WalletService
  ],

  exports: [],
})
export class MemberModule {}

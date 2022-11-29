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
import { LookupService } from '../happy-point/service/lookup.service'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { MemberService as AddressMemberService } from '../address/service/member.service'
import { OtpService } from '../otp/service/otp.service'
import { WalletService } from '../wallet/service/wallet.service'
import { ShippopService } from '../order/service/shippop.service'

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
    LookupService,
    HappyPointService,
    OtpService,
    WalletService,
    AddressMemberService,
    ShippopService,
  ],

  exports: [],
})
export class MemberModule {}

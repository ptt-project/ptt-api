import { Module } from '@nestjs/common'
import { EmailService } from '../email/service/email.service'
import { MemberEmailService } from './service/email.service'

import { MemberController } from './member.controller'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'
import { ProductService } from './service/product.service'

@Module({
  controllers: [MemberController],
  providers: [
    PasswordService,
    MemberService,
    EmailService,
    ProductService,
    MemberEmailService,
  ],
  exports: [],
})
export class MemberModule {}

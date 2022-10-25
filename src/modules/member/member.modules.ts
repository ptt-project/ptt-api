import { Module } from '@nestjs/common'
import { EmailService } from './service/email.service'

import { MemberController } from './member.controller'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'
import { ProductService } from './service/product.service'

@Module({
  controllers: [MemberController],
  providers: [PasswordService, MemberService, EmailService, ProductService],
  exports: [],
})
export class MemberModule {}

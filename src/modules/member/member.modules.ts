import { Module } from '@nestjs/common'
import { EmailService } from './service/email.service'

import { MemberController } from './member.controller'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'

@Module({
  controllers: [MemberController],
  providers: [PasswordService, MemberService, EmailService],
  exports: [],
})
export class MemberModule {}

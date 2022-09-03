import { Module } from '@nestjs/common'
import { MemberEmailService } from './email.service'
import { EmailService } from '../email/email.service'

import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { PasswordService } from './password.service'

@Module({
  controllers: [MemberController],
  providers: [PasswordService, MemberService, EmailService, MemberEmailService],
  exports: [],
})
export class MemberModule {}

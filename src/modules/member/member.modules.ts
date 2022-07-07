import { Module } from '@nestjs/common'
import { EmailService } from './email.service'

import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { PasswordService } from './password.service'

@Module({
  controllers: [MemberController],
  providers: [PasswordService, MemberService, EmailService],
  exports: [],
})
export class MemberModule {}

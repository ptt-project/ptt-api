import { Module } from '@nestjs/common'
import { EmailService } from './email.service'

import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { PasswordService } from './password.service'
import { RelationService } from './relation.service'

@Module({
  controllers: [MemberController],
  providers: [PasswordService, MemberService, EmailService, RelationService],
  exports: [],
})
export class MemberModule {}

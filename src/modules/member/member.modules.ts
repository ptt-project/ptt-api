import { Module } from '@nestjs/common'

import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { PasswordService } from './password.service'

@Module({
  controllers: [MemberController],
  providers: [PasswordService, MemberService],
  exports: [],
})
export class MemberModule {}

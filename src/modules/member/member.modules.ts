import { Module } from '@nestjs/common'

import { MemberController } from './member.controller'
import { PasswordService } from './password.service'

@Module({
  controllers: [MemberController],
  providers: [PasswordService],
  exports: [],
})
export class MemberModule {}

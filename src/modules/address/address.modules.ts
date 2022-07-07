import { Module } from '@nestjs/common'

import { AddressController } from './address.controller'
import { MemberService } from './member.service'

@Module({
  controllers: [AddressController],
  providers: [MemberService],
  exports: [],
})
export class AddressModule {}

import { Module } from '@nestjs/common'
import { ConditionService } from '../shop/service/condition.service'

import { SellerController } from './seller.controller'
import { RegisterService } from './service/register.service'
@Module({
  controllers: [SellerController],
  providers: [RegisterService, ConditionService],
  exports: [RegisterService],
})
export class SellerModule {}

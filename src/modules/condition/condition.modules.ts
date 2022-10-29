import { Module } from '@nestjs/common'
import { ShopService } from '../seller/service/shop.service'
import { ConditionController } from './condition.controller'
import { ConditionService } from './condition.service'

@Module({
  controllers: [ConditionController],
  providers: [ConditionService, ShopService],
  exports: [],
})
export class ConditionModule {}

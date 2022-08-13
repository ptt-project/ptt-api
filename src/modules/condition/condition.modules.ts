import { Module } from '@nestjs/common'
import { ShopService } from '../seller/shop.service'
import { ConditionController } from './condition.controller'
import { ConditionService } from './condition.service'

@Module({
  controllers: [ConditionController],
  providers: [ConditionService, ShopService],
  exports: [],
})
export class ConditionModule {}

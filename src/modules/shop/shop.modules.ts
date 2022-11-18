import { Module } from '@nestjs/common'
import { ConditionService } from './service/condition.service'
import { ShopService } from './service/shop.service'
import { ShopController } from './shop.controller'

@Module({
  controllers: [ShopController],
  providers: [ShopService, ConditionService],
  exports: [],
})
export class ShopModule {}

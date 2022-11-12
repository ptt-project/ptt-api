import { Module } from '@nestjs/common'
import { ShopService } from './service/shop.service'
import { ShopController } from './shop.controller'

@Module({
  controllers: [ShopController],
  providers: [ShopService],
  exports: [],
})
export class ShopModule {}

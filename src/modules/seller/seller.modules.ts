import { Module } from '@nestjs/common'

import { SellerController } from './seller.controller'
import { RegisterService } from './register.service'
import { ShopService } from './shop.service'

@Module({
  controllers: [SellerController],
  providers: [RegisterService, ShopService],
  exports: [RegisterService],
})
export class SellerModule {}

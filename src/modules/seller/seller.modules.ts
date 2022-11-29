import { Module } from '@nestjs/common'
import { ShopService } from '../shop/service/shop.service'
import { WalletService } from '../wallet/service/wallet.service'
import { ConditionService } from '../shop/service/condition.service'

import { SellerController } from './seller.controller'
import { RegisterService } from './service/register.service'
@Module({
  controllers: [SellerController],
  providers: [RegisterService, ShopService, WalletService, ConditionService],
  exports: [RegisterService],
})
export class SellerModule {}

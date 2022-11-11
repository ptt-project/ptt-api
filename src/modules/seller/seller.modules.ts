import { Module } from '@nestjs/common'
import { ShopService } from '../shop/service/shop.service'
import { WalletService } from '../wallet/service/wallet.service'

import { SellerController } from './seller.controller'
import { RegisterService } from './service/register.service'
@Module({
  controllers: [SellerController],
  providers: [RegisterService, ShopService, WalletService],
  exports: [RegisterService],
})
export class SellerModule {}

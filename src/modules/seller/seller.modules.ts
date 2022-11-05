import { Module } from '@nestjs/common'
import { WalletService } from '../wallet/service/wallet.service'

import { SellerController } from './seller.controller'
import { RegisterService } from './service/register.service'
import { ShopService } from './service/shop.service'

@Module({
  controllers: [SellerController],
  providers: [RegisterService, ShopService, WalletService],
  exports: [RegisterService],
})
export class SellerModule {}

import { Module } from '@nestjs/common'
import { MemberFlashSaleController } from './controller/member-flash-sale.controller'
import { SellerFlashSaleController } from './controller/seller-flash-sale.controller'
import { MemberFlashSaleService } from './service/member-flash-sale.service'
import { SellerFlashSaleService } from './service/seller-flash-sale.service'

@Module({
  controllers: [SellerFlashSaleController, MemberFlashSaleController],
  providers: [SellerFlashSaleService, MemberFlashSaleService],
  exports: [SellerFlashSaleService, MemberFlashSaleService],
})
export class FlashSaleModule {}
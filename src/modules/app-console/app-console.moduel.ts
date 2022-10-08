import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.modules'
import { SellerModule } from '../seller/seller.modules'
import { AppConsoleService } from './app-console.service'
import { MockDataConsoleService } from './mock-data.service'
import { ProductService } from '../product/product.service'
import { EmailModule } from '../email/email.module'
import { SellerFlashSaleService } from '../flash-sale/service/seller-flash-sale.service'
import { FlashSaleModule } from '../flash-sale/flash-sale.module'

@Module({
  imports: [AuthModule, SellerModule, EmailModule, FlashSaleModule],
  providers: [AppConsoleService, MockDataConsoleService, ProductService, SellerFlashSaleService],
})
export class AppConsoleModule {}

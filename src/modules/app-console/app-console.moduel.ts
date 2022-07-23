import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.modules'
import { ProductService } from '../product/product.service'
import { SellerModule } from '../seller/seller.modules'
import { AppConsoleService } from './app-console.service'
import { MockDataConsoleService } from './mock-data.service'

@Module({
  imports: [AuthModule, SellerModule],
  providers: [AppConsoleService, MockDataConsoleService, ProductService],
})
export class AppConsoleModule {}

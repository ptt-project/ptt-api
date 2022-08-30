import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.modules'
import { SellerModule } from '../seller/seller.modules'
import { AppConsoleService } from './app-console.service'
import { MockDataConsoleService } from './mock-data.service'
import { ProductService } from '../product/product.service'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [AuthModule, SellerModule, EmailModule],
  providers: [AppConsoleService, MockDataConsoleService, ProductService],
})
export class AppConsoleModule {}

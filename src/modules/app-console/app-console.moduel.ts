import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.modules'
import { SellerModule } from '../seller/seller.modules'
import { WalletModule } from '../wallet/wallet.modules'
import { AppConsoleService } from './service/app-console.service'
import { MockDataConsoleService } from './service/mock-data.service'
import { UnitTestConsoleService } from './service/unit-test.service'
import { CreateWalletConsoleService } from './service/create-wallet.service'
import { ProductService } from '../product/service/product.service'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [AuthModule, SellerModule, WalletModule, EmailModule],
  providers: [
    AppConsoleService,
    MockDataConsoleService,
    UnitTestConsoleService,
    CreateWalletConsoleService,
    ProductService,
  ],
})
export class AppConsoleModule {}

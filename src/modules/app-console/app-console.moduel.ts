import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.modules'
import { SellerModule } from '../seller/seller.modules'
import { WalletModule } from '../wallet/wallet.modules'
import { AppConsoleService } from './app-console.service'
import { MockDataConsoleService } from './mock-data.service'
import { UnitTestConsoleService } from './unit-test.service'
import { CreateWalletConsoleService } from './create-wallet.service'
import { ProductService } from '../product/product.service'
import { EmailModule } from '../email/email.module'
import { HappyPointModule } from '../happy-point/happy-point.module'
import { HappyPointService } from '../happy-point/service/happy-point.service'

@Module({
  imports: [
    AuthModule,
    SellerModule,
    WalletModule,
    EmailModule,
    HappyPointModule,
  ],
  providers: [
    AppConsoleService,
    MockDataConsoleService,
    UnitTestConsoleService,
    CreateWalletConsoleService,
    ProductService,
    HappyPointService,
  ],
})
export class AppConsoleModule {}

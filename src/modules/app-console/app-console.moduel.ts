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
import { HappyPointModule } from '../happy-point/happy-point.module'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { InitialAppConsoleService } from './initial-app.service'

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
    InitialAppConsoleService,
  ],
})
export class AppConsoleModule {}

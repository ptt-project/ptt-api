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
import { InitialAppConsoleService } from './service/initial-app.service'
import { OtpModule } from '../otp/otp.modules'
import { MobileModule } from '../mobile/mobile.modules'
import { OtpService } from '../otp/service/otp.service'
import { MobileService } from '../mobile/service/mobile.service'
import { RegisterService } from '../seller/service/register.service'
import { OrderModule } from '../order/order.module'
import { OrderService } from '../order/service/order.service'
import { ConditionService } from '../shop/service/condition.service'
import { CreateConditionConsoleService } from './service/create-condition.service'

@Module({
  imports: [
    AuthModule,
    SellerModule,
    WalletModule,
    EmailModule,
    HappyPointModule,
    OtpModule,
    MobileModule,
    HappyPointModule,
    OrderModule,
    SellerModule,
  ],
  providers: [
    AppConsoleService,
    MockDataConsoleService,
    UnitTestConsoleService,
    CreateWalletConsoleService,
    ProductService,
    HappyPointService,
    InitialAppConsoleService,
    OtpService,
    MobileService,
    RegisterService,
    OrderService,
    ConditionService,
    CreateConditionConsoleService,
  ],
})
export class AppConsoleModule {}

import { Module } from '@nestjs/common'
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module'
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service'
import { OtpModule } from '../otp/otp.modules'
import { OtpService } from '../otp/otp.service'
import { WalletModule } from '../wallet/wallet.modules'
import { WalletService } from '../wallet/wallet.service'
import { HappyPointContoller } from './happy-point.controller'
import { HappyPointService } from './happy-point.service'
import { LookupService } from './lookup.service'

@Module({
  imports: [ExchangeRateModule, OtpModule, WalletModule],
  controllers: [HappyPointContoller],
  providers: [
    ExchangeRateService,
    HappyPointService,
    LookupService,
    OtpService,
    WalletService,
  ],
  exports: [HappyPointService],
})
export class HappyPointModule {}

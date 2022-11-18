import { Module } from '@nestjs/common'
import { BankAccountService } from '../bankAccount/service/bankAccount.service'
import { OtpService } from '../otp/service/otp.service'

import { WalletController } from './wallet.controller'
import { WalletService } from './service/wallet.service'
import { MasterConfigService } from '../master-config/service/master-config.service'
import { WalletLookupService } from './service/lookup.service'

@Module({
  controllers: [WalletController],
  providers: [WalletService, OtpService, BankAccountService, MasterConfigService, WalletLookupService],
  exports: [WalletService],
})
export class WalletModule {}

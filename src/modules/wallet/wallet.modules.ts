import { Module } from '@nestjs/common'
import { BankAccountService } from '../bankAccount/service/bankAccount.service'
import { OtpService } from '../otp/service/otp.service'

import { WalletController } from './wallet.controller'
import { WalletService } from './service/wallet.service'

@Module({
  controllers: [WalletController],
  providers: [WalletService, OtpService, BankAccountService],
  exports: [WalletService],
})
export class WalletModule {}

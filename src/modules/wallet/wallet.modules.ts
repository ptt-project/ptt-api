import { Module } from '@nestjs/common'
import { BankAccountService } from '../bankAccount/bankAccount.service'
import { OtpService } from '../otp/otp.service'

import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'

@Module({
  controllers: [WalletController],
  providers: [WalletService, OtpService, BankAccountService],
  exports: [WalletService],
})
export class WalletModule {}

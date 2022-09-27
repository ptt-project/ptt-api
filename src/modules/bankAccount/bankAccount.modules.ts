import { Module } from '@nestjs/common'
import { OtpService } from '../otp/service/otp.service'

import { BankAccountController } from './bankAccount.controller'
import { BankAccountService } from './service/bankAccount.service'

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountService, OtpService],
  exports: [BankAccountService],
})
export class BankAccountModule {}

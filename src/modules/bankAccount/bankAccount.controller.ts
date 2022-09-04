import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'

import { BankAccountService } from './bankAccount.service'
import { Member } from 'src/db/entities/Member'
import { CreateBankAccoutRequestDTO, GetBankAccoutRequestDTO } from './dto/BankAccount.dto'
import { OtpService } from '../otp/otp.service'

@Auth()
@Controller('v1/bank-accounts')
export class BankAccountController {
  constructor(
    private readonly bankAccountService: BankAccountService,
    private readonly otpService: OtpService,
  ) {}

  @Get('/')
  @Transaction()
  async getBankAccount(
    @ReqUser() member: Member,
    @Body() body: GetBankAccoutRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.bankAccountService.GetBankAccountsHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.bankAccountService.InqueryBankAccountsFormDbFunc(etm)
    )(member, body)
  }

  @Post('/')
  @Transaction()
  async createBankAccount(
    @ReqUser() member: Member,
    @Body() body: CreateBankAccoutRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.bankAccountService.CreateBankAccountsHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.bankAccountService.InsertBankAccountsFormDbFunc(etm)
    )(member, body)
  }
}

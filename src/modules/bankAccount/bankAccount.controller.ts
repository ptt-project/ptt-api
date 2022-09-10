import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'

import { BankAccountService } from './bankAccount.service'
import { Member } from 'src/db/entities/Member'
import { CreateBankAccoutRequestDTO, DeleteBankAccoutRequestDTO, EditBankAccoutRequestDTO, GetBankAccoutRequestDTO } from './dto/BankAccount.dto'
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
    @Query() query: GetBankAccoutRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.bankAccountService.GetBankAccountsHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.bankAccountService.InqueryBankAccountsFormDbFunc(etm)
    )(member, query)
  }

  @Get('/options')
  @Transaction()
  async getBankAccountOptions(
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.bankAccountService.GetBankAccountOptionsHandler(
      this.bankAccountService.InqueryBankAccountsFormDbFunc(etm),
    )(member)
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
      this.bankAccountService.ValidateBankAccountFunc(etm),
      this.bankAccountService.InsertBankAccountsFormDbFunc(etm),
    )(member, body)
  }

  @Put('/:bankAccountId')
  @Transaction()
  async editBankAccount(
    @ReqUser() member: Member,
    @Param('bankAccountId') bankAccountId: number,
    @Body() body: EditBankAccoutRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.bankAccountService.EditBankAccountsHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.bankAccountService.InqueryBankAccountFormDbFunc(etm),
      this.bankAccountService.ValidateBankAccountFunc(etm),
      this.bankAccountService.UpdateBankAccountFunc(etm),
    )(member, bankAccountId, body)
  }

  @Patch('/:bankAccountId/delete')
  @Transaction()
  async deleteBankAccount(
    @ReqUser() member: Member,
    @Param('bankAccountId') bankAccountId: number,
    @Body() body: DeleteBankAccoutRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.bankAccountService.DeleteBankAccountsHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.bankAccountService.InqueryBankAccountFormDbFunc(etm),
      this.bankAccountService.DeleteBankAccountFormDbFunc(etm),
    )(member, bankAccountId, body)
  }

  @Patch('/:bankAccountId/set-main')
  @Transaction()
  async setMainBankAccount(
    @ReqUser() member: Member,
    @Param('bankAccountId') bankAccountId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.bankAccountService.SetMainBankAccountsHandler(
      this.bankAccountService.InqueryBankAccountFormDbFunc(etm),
      this.bankAccountService.SetMainBankAccountFunc(etm),
    )(member, bankAccountId)
  }
}

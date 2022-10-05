import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser, ReqWallet } from '../auth/auth.decorator'

import { WalletService } from './service/wallet.service'
import { getWalletTransactionQueryDTO, RequestDepositQrCodeRequestDTO, WithdrawRequestDTO } from './dto/wallet.dto'
import { Wallet } from 'src/db/entities/Wallet'
import { OtpService } from '../otp/service/otp.service'
import { Member } from 'src/db/entities/Member'
import { BankAccountService } from '../bankAccount/service/bankAccount.service'

@Auth()
@Controller('v1/wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly otpService: OtpService,
    private readonly bankAccountService: BankAccountService,
  ) {}

  @Get('/')
  async getWallet(
    @ReqWallet() wallet: Wallet,
  ) {
    return await this.walletService.GetWalletHandler()(wallet)
  }

  @Get('/history')
  @Transaction()
  async getWalletTransaction(
    @ReqWallet() wallet: Wallet,
    @Query() query: getWalletTransactionQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.walletService.GetWalletTransactionHandler(
      this.walletService.InqueryWalletTransactionFromDbFunc(etm)
    )(wallet, query)
  }

  @Post('/deposit/qrcode')
  @Transaction()
  async requestDepositQrCode(
    @ReqWallet() wallet: Wallet,
    @Body() body: RequestDepositQrCodeRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.walletService.RequestDepositQrCodeHandler(
      this.walletService.InsertTransactionToDbFunc(etm),
      this.walletService.InsertDepositReferenceToDbFunc(etm),
      this.walletService.RequestDepositQrCodeFunc(etm),
      this.walletService.AdjustWalletInDbFunc(etm),
    )(wallet, body)
  }

  @Post('/withdraw')
  @Transaction()
  async withdraw(
    @ReqWallet() wallet: Wallet,
    @ReqUser() member: Member,
    @Body() body: WithdrawRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.walletService.WithdrawHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.bankAccountService.InqueryBankAccountFormDbFunc(etm),
      this.walletService.InsertTransactionToDbFunc(etm),
      this.walletService.InsertWithdrawReferenceToDbFunc(etm),
      this.walletService.RequestWithdrawFunc(etm),
      this.walletService.AdjustWalletInDbFunc(etm),
    )(member, wallet, body)
  }
}

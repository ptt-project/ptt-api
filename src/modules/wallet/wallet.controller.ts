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
import { MasterConfigService } from '../master-config/service/master-config.service'
import { RedisService } from 'nestjs-redis'
import { WalletLookupService } from './service/lookup.service'

@Auth()
@Controller('v1/wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly otpService: OtpService,
    private readonly bankAccountService: BankAccountService,
    private readonly masterConfigService: MasterConfigService,
    private readonly redisService: RedisService,
    private readonly walletLookupService: WalletLookupService,
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
      this.walletService.InsertReferenceToDbFunc(etm),
      this.walletService.RequestDepositQrCodeFunc(etm),
      this.walletService.AdjustWalletInDbFunc(etm),
    )(wallet, body)
  }

  @Post('lookup')
  @Transaction()
  async lookupController(
    @ReqWallet() wallet: Wallet,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.walletLookupService.LookupHandler(
      this.masterConfigService.InquiryMasterConfigFunc(etm),
      this.walletLookupService.SetCacheLookupToRedisFunc(redis),
    )(wallet)
  }

  @Post('/withdraw')
  @Transaction()
  async withdraw(
    @ReqWallet() wallet: Wallet,
    @ReqUser() member: Member,
    @Body() body: WithdrawRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.walletService.WithdrawHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.walletLookupService.InquiryRefIdExistInTransactionFunc(etm),
      this.walletLookupService.GetCacheLookupToRedisFunc(redis),
      this.walletService.ValidateCalculateWithdrawAndFeeFunc(),
      this.bankAccountService.InqueryBankAccountFormDbFunc(etm),
      this.walletService.InsertTransactionToDbFunc(etm),
      this.walletService.InsertReferenceToDbFunc(etm),
      this.walletService.RequestWithdrawFunc(etm),
      this.walletService.AdjustWalletInDbFunc(etm),
    )(member, wallet, body)
  }
}

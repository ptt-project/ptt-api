import { Controller, Post, Body } from '@nestjs/common'
import { HappyPointService } from './happy-point.service'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqHappyPoint, ReqWallet } from '../auth/auth.decorator'
import { BuyHappyPointRequestDto } from './dto/buy.dto'
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service'
import { LookupService } from './lookup.service'
import { OtpService } from '../otp/otp.service'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { TransferHappyPointDto } from './dto/transfer.dto'
import { WalletService } from '../wallet/wallet.service'
import { Wallet } from 'src/db/entities/Wallet'

@Auth()
@Controller('v1/happy-points')
export class HappyPointContoller {
  constructor(
    private readonly lookupService: LookupService,
    private readonly happyService: HappyPointService,
    private readonly exchagneRateService: ExchangeRateService,
    private readonly otpService: OtpService,
    private readonly walletService: WalletService,
  ) {}

  @Post('lookup')
  @Transaction()
  async lookupController(
    @ReqHappyPoint() happyPoint: HappyPoint,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.lookupService.LookupHandler(
      this.exchagneRateService.InquiryCurrentExchangeRateFromDbFunc(),
      this.lookupService.InsertLookupToDbFunc(etm),
    )(happyPoint)
  }

  @Post('buy')
  @Transaction()
  async buyHappyPoitnController(
    @ReqWallet() wallet: Wallet,
    @ReqHappyPoint() happyPoint: HappyPoint,
    @Body() body: BuyHappyPointRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.happyService.BuyHappyPointHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.lookupService.LookupExchangeRageFunc(etm),
      this.happyService.ValidateCalculatePointByExchangeAndAmountFunc(),
      this.happyService.InsertHappyPointTransactionToDbFunc(etm),
      this.happyService.UpdateCreditBalanceMemberToDbFunc(etm),
      // this.walletService.AdjustWalletInDbFunc(etm),
    )(wallet, happyPoint, body)
  }

  @Post('transfer')
  @Transaction()
  async transferHappyPointController(
    @ReqHappyPoint() happyPoint: HappyPoint,
    @Body() body: TransferHappyPointDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.happyService.TransferHappyPointHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.lookupService.LookupExchangeRageFunc(etm),
      this.happyService.ValidateCalculatePointByTotalPointAndFeeFunc(),
      this.happyService.InquiryHappyPointFromUsernameFunc(etm),
      this.happyService.InsertHappyPointTransactionToDbFunc(etm),
      this.happyService.UpdateCreditBalanceMemberToDbFunc(etm),
      this.happyService.UpdatDebitBalanceMemberToDbFunc(etm),
    )(happyPoint, body)
  }
}

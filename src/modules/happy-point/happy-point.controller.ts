import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { HappyPointService } from './service/happy-point.service'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqHappyPoint, ReqUser, ReqWallet } from '../auth/auth.decorator'
import { MasterConfigService } from '../master-config/service/master-config.service'
import { LookupService } from './service/lookup.service'
import { OtpService } from '../otp/service/otp.service'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { WalletService } from '../wallet/service/wallet.service'
import { Wallet } from 'src/db/entities/Wallet'
import {
  SellHappyPointRequestDto,
  TransferHappyPointDto,
  BuyHappyPointRequestDto,
} from './dto/happy-point.dto'
import { RedisService } from 'nestjs-redis'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { GetHappyPointHistoryDto } from './dto/happy-point-transaction'
import { HappyPointTransactionService } from './service/happy-point-transction.service'

@Auth()
@Controller('v1/happy-points')
export class HappyPointContoller {
  constructor(
    private readonly lookupService: LookupService,
    private readonly happyService: HappyPointService,
    private readonly masterConfigService: MasterConfigService,
    private readonly otpService: OtpService,
    private readonly walletService: WalletService,
    private readonly redisService: RedisService,
    private readonly happyPointTransactionService: HappyPointTransactionService,
  ) {}

  @Post('lookup')
  @Transaction()
  async lookupController(
    @ReqHappyPoint() happyPoint: HappyPoint,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.lookupService.LookupHandler(
      this.masterConfigService.InquiryMasterConfigFunc(etm),
      this.lookupService.SetCacheLookupToRedisFunc(redis),
    )(happyPoint)
  }

  @Post('buy')
  @Transaction()
  async buyHappyPoitnController(
    @ReqWallet() wallet: Wallet,
    @ReqHappyPoint() happyPoint: HappyPoint,
    @ReqUser() member: Member,
    @Body() body: BuyHappyPointRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.happyService.BuyHappyPointHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.lookupService.InquiryRefIdExistInTransactionFunc(etm),
      this.lookupService.GetCacheLookupToRedisFunc(redis),
      this.happyService.ValidateCalculatePointByExchangeAndAmountFunc(),
      this.happyService.InsertHappyPointTransactionToDbFunc(etm),
      this.walletService.RequestInteranlWalletTransactionService(
        this.walletService.InsertTransactionToDbFunc(etm),
        this.walletService.InsertReferenceToDbFunc(etm),
        this.walletService.UpdateReferenceToDbFunc(etm),
        this.walletService.AdjustWalletInDbFunc(etm),
      ),
      this.happyService.UpdateCreditBalanceMemberToDbFunc(etm),
    )(wallet, happyPoint, member, body)
  }

  @Post('sell')
  @Transaction()
  async sellHappyPoitnController(
    @ReqWallet() wallet: Wallet,
    @ReqHappyPoint() happyPoint: HappyPoint,
    @ReqUser() member: Member,
    @Body() body: SellHappyPointRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.happyService.SellHappyPointHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.happyService.DebitHappyPointFunc(
        this.lookupService.InquiryRefIdExistInTransactionFunc(etm),
        this.lookupService.GetCacheLookupToRedisFunc(redis),
        this.happyService.ValidateCalculateFeeAmountFunc(),
        this.happyService.ValidateCalculatePointByExchangeAndAmountFunc(),
        this.happyService.ValidateCalculateAmountFunc(),
        this.happyService.InsertHappyPointTransactionToDbFunc(etm),
        this.happyService.UpdatDebitBalanceMemberToDbFunc(etm),
      ),
      this.walletService.RequestInteranlWalletTransactionService(
        this.walletService.InsertTransactionToDbFunc(etm),
        this.walletService.InsertReferenceToDbFunc(etm),
        this.walletService.UpdateReferenceToDbFunc(etm),
        this.walletService.AdjustWalletInDbFunc(etm),
      ),
    )(wallet, happyPoint, member, body)
  }

  @Post('transfer')
  @Transaction()
  async transferHappyPointController(
    @ReqHappyPoint() happyPoint: HappyPoint,
    @ReqUser() member: Member,
    @Body() body: TransferHappyPointDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.happyService.TransferHappyPointHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.lookupService.InquiryRefIdExistInTransactionFunc(etm),
      this.lookupService.GetCacheLookupToRedisFunc(redis),
      this.happyService.ValidateCalculateFeePointFunc(),
      this.happyService.ValidateCalculatePointByTotalPointAndFeeFunc(),
      this.happyService.ValidateLimitTransferFunc(),
      this.happyService.InquiryHappyPointFromUsernameFunc(etm),
      this.happyService.InsertHappyPointTransactionToDbFunc(etm),
      this.happyService.UpdateCreditBalanceMemberToDbFunc(etm),
      this.happyService.UpdatDebitBalanceMemberToDbFunc(etm),
      this.happyService.UpdateDebitLimitTransferToDbFunc(etm),
    )(happyPoint, member, body)
  }

  @Get('balance')
  @Transaction()
  async getBalanceHappyPoint(@ReqHappyPoint() happyPoint: HappyPoint) {
    return response({ balance: happyPoint.balance })
  }

  @Get('history')
  @Transaction()
  async getHappyPotintHistory(
    @ReqHappyPoint() happyPoint: HappyPoint,
    @Query() query: GetHappyPointHistoryDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.happyPointTransactionService.GetHappyPointHistory(
      this.happyPointTransactionService.InquiryHappyPointTransactionToDbFunc(
        etm,
      ),
      this.happyPointTransactionService.ResponseHappyPointTransctionToHistoryFunc(),
    )(happyPoint, query)
  }
}

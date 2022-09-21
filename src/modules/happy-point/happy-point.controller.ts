import { Controller, Post, Body } from '@nestjs/common'
import { HappyPointService } from './service/happy-point.service'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqHappyPoint, ReqWallet } from '../auth/auth.decorator'
import { BuyHappyPointRequestDto } from './dto/buy.dto'
import { MasterConfigService } from '../master-config/service/master-config.service'
import { LookupService } from './service/lookup.service'
import { OtpService } from '../otp/otp.service'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { TransferHappyPointDto } from './dto/transfer.dto'
import { WalletService } from '../wallet/wallet.service'
import { Wallet } from 'src/db/entities/Wallet'
import { SellHappyPointRequestDto } from './dto/sell.dto'
import { RedisService } from 'nestjs-redis'

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
    @Body() body: BuyHappyPointRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.happyService.BuyHappyPointHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
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
    )(wallet, happyPoint, body)
  }

  @Post('sell')
  @Transaction()
  async sellHappyPoitnController(
    @ReqWallet() wallet: Wallet,
    @ReqHappyPoint() happyPoint: HappyPoint,
    @Body() body: SellHappyPointRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.happyService.SellHappyPointHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.lookupService.InquiryRefIdExistInTransactionFunc(etm),
      this.lookupService.GetCacheLookupToRedisFunc(redis),
      this.happyService.ValidateCalculateFeeAmountFunc(),
      this.happyService.ValidateCalculatePointByExchangeAndAmountFunc(),
      this.happyService.ValidateCalculateAmountFunc(),
      this.happyService.InsertHappyPointTransactionToDbFunc(etm),
      this.walletService.RequestInteranlWalletTransactionService(
        this.walletService.InsertTransactionToDbFunc(etm),
        this.walletService.InsertReferenceToDbFunc(etm),
        this.walletService.UpdateReferenceToDbFunc(etm),
        this.walletService.AdjustWalletInDbFunc(etm),
      ),
      this.happyService.UpdatDebitBalanceMemberToDbFunc(etm),
    )(wallet, happyPoint, body)
  }

  @Post('transfer')
  @Transaction()
  async transferHappyPointController(
    @ReqHappyPoint() happyPoint: HappyPoint,
    @Body() body: TransferHappyPointDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()

    return await this.happyService.TransferHappyPointHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
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
    )(happyPoint, body)
  }
}

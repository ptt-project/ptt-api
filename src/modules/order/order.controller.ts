import { Body, Controller, Post } from '@nestjs/common'
import { RedisService } from 'nestjs-redis'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { Member } from 'src/db/entities/Member'
import { Wallet } from 'src/db/entities/Wallet'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqHappyPoint, ReqUser, ReqWallet } from '../auth/auth.decorator'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { LookupService } from '../happy-point/service/lookup.service'
import { OtpService } from '../otp/service/otp.service'
import { WalletService } from '../wallet/service/wallet.service'
import { CreateOrderDto } from './dto/createOrder.dto'
import { OrderService } from './service/order.service'

@Auth()
@Controller('v1/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly lookupService: LookupService,
    private readonly happyService: HappyPointService,
    private readonly otpService: OtpService,
    private readonly walletService: WalletService,
    private readonly redisService: RedisService,
  ) {}

  @Auth()
  @Post('')
  @Transaction()
  async createOrder(
    @ReqWallet() wallet: Wallet,
    @ReqHappyPoint() happyPoint: HappyPoint,
    @ReqUser() member: Member,
    @Body() body: CreateOrderDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const redis = this.redisService.getClient()
    return await this.orderService.CheckoutHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.orderService.ValidateOrderParamsFunc(
        this.orderService.InquiryShopByIdFunc(etm),
        this.orderService.InquiryProductByIdFunc(etm),
      ),
      this.orderService.InsertOrderToDbFunc(etm),
      this.orderService.InsertOrderShopToDbFunc(etm),
      this.orderService.InsertOrderShopProductFunc(
        this.orderService.InquiryProductByIdFunc(etm),
        this.orderService.UpdateStockToProductFunc(etm),
        this.orderService.InquiryProductProfileByIdFunc(etm),
        this.orderService.InsertOrderShopProductToDbFunc(etm),
      ),
      this.happyService.DebitHappyPointFunc(
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
      ),
      this.walletService.InsertTransactionToDbFunc(etm),
      this.walletService.InsertReferenceToDbFunc(etm),
      this.walletService.UpdateReferenceToDbFunc(etm),
      this.walletService.AdjustWalletInDbFunc(etm),
      this.orderService.InsertPaymentByBankToDbFunc(etm),
      this.orderService.InsertPaymentByHappyPointToDbFunc(etm),
      this.orderService.InsertPaymentByEwalletToDbFunc(etm),
      this.orderService.UpdatePaymentIdToOrderFunc(etm),
      this.orderService.AdjustWalletToSellerFunc(
        this.walletService.InquiryWalletByShopIdFunc(etm),
        this.walletService.InsertTransactionToDbFunc(etm),
        this.walletService.InsertReferenceToDbFunc(etm),
        this.walletService.UpdateReferenceToDbFunc(etm),
        this.walletService.AdjustWalletInDbFunc(etm),
      ),
    )(wallet, happyPoint, member, body)
  }
}

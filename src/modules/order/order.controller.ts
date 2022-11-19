import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common'
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
import { CreateOrderDto, GetOrderRequestDto } from './dto/createOrder.dto'
import { OrderService } from './service/order.service'
import { PaymentService } from './service/payment.service'

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
    private readonly paymentService: PaymentService,
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
      this.orderService.CreateOrderToDbFunc(
        this.orderService.InquiryShopByIdFunc(etm),
        this.orderService.InquiryProductByIdFunc(etm),
        this.orderService.InsertOrderToDbFunc(etm),
        this.orderService.InsertOrderShopToDbFunc(etm),
        this.orderService.InsertOrderShopProductFunc(
          this.orderService.InquiryProductByIdFunc(etm),
          this.orderService.UpdateStockToProductFunc(etm),
          this.orderService.InquiryProductProfileByIdFunc(etm),
          this.orderService.InsertOrderShopProductToDbFunc(etm),
        ),
      ),
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
      this.walletService.InsertTransactionToDbFunc(etm),
      this.walletService.InsertReferenceToDbFunc(etm),
      this.walletService.UpdateReferenceToDbFunc(etm),
      this.walletService.AdjustWalletInDbFunc(etm),
      this.paymentService.InsertPaymentByBankToDbFunc(etm),
      this.paymentService.InsertPaymentByHappyPointToDbFunc(etm),
      this.paymentService.InsertPaymentByEwalletToDbFunc(etm),
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

  @Get('order-shops')
  @Transaction()
  async getOrderShops(
    @ReqUser() member: Member,
    @Query() query: GetOrderRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.orderService.GetOrderShopsHandler(
      this.orderService.InquiryOrderShopsFunc(etm),
    )(member, query)
  }

  @Get('order-shops/:orderShopId')
  @Transaction()
  async getOrderShopById(
    @Param('orderShopId') orderShopId: string,
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.orderService.GetOrderShopByIdHandler(
      this.orderService.InquiryOrderShopByIdFunc(etm),
    )(member, orderShopId)
  }
}

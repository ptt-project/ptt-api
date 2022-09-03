import { Controller, Post, Body } from '@nestjs/common'
import { HappyPointService } from './happy-point.service'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Member } from 'src/db/entities/Member'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { BuyHappyPointRequestDto } from './dto/buy.dto'
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service'
import { LookupService } from './lookup.service'
import { OtpService } from '../otp/otp.service'

@Auth()
@Controller('v1/happy-points')
export class HappyPointContoller {
  constructor(
    private readonly lookupService: LookupService,
    private readonly happyService: HappyPointService,
    private readonly exchagneRateService: ExchangeRateService,
    private readonly otpService: OtpService,
  ) {}

  @Post('lookup')
  @Transaction()
  async lookupController(
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.lookupService.LookupHandler(
      this.exchagneRateService.InquiryCurrentExchangeRateFromDbFunc(),
      this.lookupService.InsertLookupToDbFunc(etm),
    )(member)
  }

  @Post('buy')
  @Transaction()
  async buyHappyPoitnController(
    @ReqUser() member: Member,
    @Body() body: BuyHappyPointRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.happyService.BuyHappyPointHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.lookupService.LookupExchangeRageFunc(etm),
      this.happyService.ValidatePointFunc(),
      this.happyService.InsertHappyPointToDbFunc(etm),
      this.happyService.UpdateCreditBalanceMemberToDbFunc(etm),
    )(member, body)
  }
}

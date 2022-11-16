import { Body, Controller, Patch, Post } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'

import { RegisterService } from './service/register.service'
import { RegisterSellerRequestDto } from './dto/seller.dto'
import { ConditionService } from '../shop/service/condition.service'

@Auth()
@Controller('v1/sellers')
export class SellerController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly conditionService: ConditionService,
  ) {}

  @Post('/register')
  @Transaction()
  async registerSeller(
    @ReqUser() member: Member,
    @Body() body: RegisterSellerRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.registerService.RegisterSellerHandler(
      this.registerService.ValidateSellerDataFunc(etm),
      this.registerService.InsertShopToDbFunc(etm),
      this.conditionService.InsertConditionToDbFunc(etm),
      this.registerService.CreateTablePartitionOfProductProfileToDbFunc(etm),
    )(member, body)
  }

  @Patch('/register/resubmit')
  @Transaction()
  async resubmitRegisterSeller(
    @ReqUser() member: Member,
    @Body() body: RegisterSellerRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.registerService.ResubmitRegisterSellerHandler(
      this.registerService.ValidateSellerDataFunc(etm),
      this.registerService.ResubmitShopToDbFunc(etm),
    )(member, body)
  }
}

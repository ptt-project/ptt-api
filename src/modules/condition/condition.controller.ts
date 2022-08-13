import { Controller, Get } from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, Seller } from '../auth/auth.decorator'
import { ConditionService } from './condition.service'

@Auth()
@Seller()
@Controller('v1/shops/conditions')
export class ConditionController {
  constructor(
    private readonly conditionService: ConditionService,
  ) {}

  @Get('/')
  @Transaction()
  async getConditions(
    @ReqShop() shop: Shop,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.conditionService.GetConditionsHandler(
      this.conditionService.InquiryConditionByShopIdFunc(etm),
    )(shop)
  }

  

}

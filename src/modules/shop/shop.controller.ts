import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, ReqUser, Seller } from '../auth/auth.decorator'
import { UpdateShopInfoRequestDto } from './dto/shop.dto'
import { ConditionService } from './service/condition.service'
import { ShopService } from './service/shop.service'

@Controller('v1/shops')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly conditionService: ConditionService,
  ) {}

  @Auth()
  @Get('/shop-info')
  @Transaction()
  async getShopInfo(
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.GetShopInfoHandler(
      this.shopService.InquiryShopByMemberIdFunc(etm),
    )(member)
  }

  @Seller()
  @Patch('/shop-info')
  @Transaction()
  async updateShopInfo(
    @ReqUser() member: Member,
    @Body() body: UpdateShopInfoRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.UpdateShopInfoHandler(
      this.shopService.UpdateShopByMemberIdFunc(etm),
    )(member, body)
  }

  @Seller()
  @Get('/conditions')
  @Transaction()
  async getConditions(
    @ReqShop() shop: Shop,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.conditionService.GetConditionsHandler(
      this.conditionService.InquiryConditionByShopIdFunc(etm),
    )(shop)
  }

  @Get('/shop-detail/:shopId')
  @Transaction()
  async getShopDetailById(
    @Param('shopId') shopId: string,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.GetShopDetailHandler(
      this.shopService.InquiryShopDetailByIdFunc(etm),
    )(shopId)
  }
}

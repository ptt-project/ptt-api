import { Body, Controller, Get, Patch, Query } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, ReqUser, Seller } from '../auth/auth.decorator'
import { SearchShopsDTO, UpdateShopInfoRequestDto } from './dto/shop.dto'
import { ConditionService } from './service/condition.service'
import { ShopService } from './service/shop.service'

@Auth()
@Controller('v1/shops')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly conditionService: ConditionService,
  ) {}

  @Get('/shop-info')
  @Transaction()
  async getShopoInfo(
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
  async updateShopoInfo(
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


  @Get('search')
  @Transaction()
  async searchProducts(
    @Query() query: SearchShopsDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.SearchShopsHandler(
      this.shopService.PreInquiryShopBySearchKeywordFromDb(etm),
      this.shopService.ExecuteInquiryShopFromDbFunc(),
      this.shopService.ConvertDataToShopSearchPageFunc(),
    )(query)
  }
}

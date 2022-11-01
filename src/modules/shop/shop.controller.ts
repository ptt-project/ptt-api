import { Body, Controller, Get, Patch } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, ReqUser, Seller } from '../auth/auth.decorator'
import { UpdateShopInfoRequestDto } from './dto/shop.dto'
import { ShopService } from './service/shop.service'

@Auth()
@Seller()
@Controller('v1/shops')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
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
  
  @Get('/conditions')
  @Transaction()
  async getConditions(
    @ReqShop() shop: Shop,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.GetConditionsHandler(
      this.shopService.InquiryConditionByShopIdFunc(etm),
    )(shop)
  }
}

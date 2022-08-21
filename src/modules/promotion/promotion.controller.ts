import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, Seller } from '../auth/auth.decorator'
import { CreatePromotionRequestDTO, GetPromotionQueryDTO } from './dto/promotion'
import { PromotionService } from './promotion.service'
@Auth()
@Seller()
@Controller('v1/shops/promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get('/')
  @Transaction()
  async GetShopPromotions(
    @ReqShop() shop: Shop,
    @Query() query: GetPromotionQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.promotionService.GetShopPromotionHandler(
      this.promotionService.InqueryPromotionFunc(etm),
    )(shop, query)
  }

  @Post('/')
  @Transaction()
  async createShopPromotions(
    @ReqShop() shop: Shop,
    @Body() body: CreatePromotionRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.promotionService.CreateShopPromotionHandler(
      this.promotionService.ValidatePromotionFunc(etm),
      this.promotionService.InsertPromotionFunc(etm),
    )(shop, body)
  }

  @Put('/:promotionId')
  @Transaction()
  async updateShopPromotions(
    @ReqShop() shop: Shop,
    @Param('promotionId') promotionId: number,
    @Body() body: CreatePromotionRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.promotionService.UpdateShopPromotionHandler(
      this.promotionService.ValidatePromotionFunc(etm),
      this.promotionService.UpdatePromotionFunc(etm),
    )(shop, body, promotionId)
  }

  @Delete('/:promotionId')
  @Transaction()
  async deleteShopPromotions(
    @ReqShop() shop: Shop,
    @Param('promotionId') promotionId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.promotionService.DeleteShopPromotionHandler(
      this.promotionService.DeletePromotionFunc(etm),
    )(shop, promotionId)
  }
}

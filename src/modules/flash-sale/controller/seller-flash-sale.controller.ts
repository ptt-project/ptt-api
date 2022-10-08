import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, Seller } from '../../auth/auth.decorator'
import { CreateFlashSaleRequestDTO, GetFlashSaleQueryDTO, GetFlashSaleRoundDTO, UpdateStatusFlashSaleRequestDTO } from '../dto/seller-flash-sale.dto'
import { SellerFlashSaleService } from '../service/seller-flash-sale.service'

@Auth()
@Seller()
@Controller('v1/shops/flash-sales')
export class SellerFlashSaleController {
  constructor(private readonly flashSaleService: SellerFlashSaleService) {}

  @Get('/rounds')
  @Transaction()
  async GetShopFlashSaleRounds(
    @Query() query: GetFlashSaleRoundDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.GetShopFlashSaleRoundHandler(
      this.flashSaleService.InqueryFlashSaleRoundFunc(etm),
    )(query)
  }

  @Get('/')
  @Transaction()
  async GetShopFlashSales(
    @ReqShop() shop: Shop,
    @Query() query: GetFlashSaleQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.GetShopFlashSaleHandler(
      this.flashSaleService.InqueryFlashSaleFunc(etm),
    )(shop, query)
  }

  @Post('/')
  @Transaction()
  async createShopFlashSale(
    @ReqShop() shop: Shop,
    @Body() body: CreateFlashSaleRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.CreateShopFlashSaleHandler(
      this.flashSaleService.ValidateFlashSaleFunc(etm),
      this.flashSaleService.InsertFlashSaleFunc(etm),
    )(shop, body)
  }

  @Put('/:flashSaleId')
  @Transaction()
  async updateShopFlashSale(
    @ReqShop() shop: Shop,
    @Param('flashSaleId') flashSaleId: number,
    @Body() body: CreateFlashSaleRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.UpdateShopFlashSaleHandler(
      this.flashSaleService.ValidateFlashSaleFunc(etm),
      this.flashSaleService.UpdateFlashSaleFunc(etm),
    )(shop, body, flashSaleId)
  }

  @Delete('/:flashSaleId')
  @Transaction()
  async deleteShopFlashSales(
    @ReqShop() shop: Shop,
    @Param('flashSaleId') flashSaleId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.DeleteShopFlashSaleHandler(
      this.flashSaleService.DeleteFlashSaleFunc(etm),
    )(shop, flashSaleId)
  }

  @Patch('/:flashSaleId/status')
  @Transaction()
  async updateStatusShopFlashSales(
    @ReqShop() shop: Shop,
    @Param('flashSaleId') flashSaleId: number,
    @Body() body: UpdateStatusFlashSaleRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.UpdateStatusShopFlashSaleHandler(
      this.flashSaleService.InquiryFlashSaleByIdFunc(etm),
      this.flashSaleService.UpdateFlashSaleFunc(etm),
    )(shop, flashSaleId, body)
  }

  @Get('/:flashSaleId')
  @Transaction()
  async getShopFlashSalesById(
    @ReqShop() shop: Shop,
    @Param('flashSaleId') flashSaleId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.GetShopFlashSaleByIdHandler(
      this.flashSaleService.InquiryFlashSaleByIdFunc(etm),
    )(shop, flashSaleId)
  }
}
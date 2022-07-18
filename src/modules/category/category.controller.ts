import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, Seller } from '../auth/auth.decorator'
import { CategoryService } from './category.service'
import { ActiveToggleRequestDto, CreateCategoryRequestDto, OrderingCategoryRequestDto } from './dto/category.dto'

@Auth()
@Seller()
@Controller('v1/shops/categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get('/')
  @Transaction()
  async getCategories(
    @ReqShop() shop: Shop,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.getCategoriesHandler(
      this.categoryService.InquiryGetCategoriesFunc(etm),
    )(shop)
  }

  @Post('/')
  @Transaction()
  async createCategory(
    @ReqShop() shop: Shop,
    @Body() body: CreateCategoryRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.createCategoryHandler(
      this.categoryService.InquiryGetCategoriesFunc(etm),
      this.categoryService.InquiryInsertCategoryFunc(etm),
    )(shop, body)
  }

  @Patch(':categoryId/active-toggle')
  @Transaction()
  async activeToggleCategory(
    @Param('categoryId') categoryId: number,
    @Body() body: ActiveToggleRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.activeToggleCategoryHandler(
      this.categoryService.getCategoryByCategoryIdFunc(etm),
      this.categoryService.updateActiveCategoryFunc(etm),
    )(categoryId, body)
  }

  @Patch('ordering')
  @Transaction()
  async orderingCategory(
    @Body() body: OrderingCategoryRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.orderingCategoryHandler(
      this.categoryService.getCategoryByCategoryIdFunc(etm),
      this.categoryService.updatePriorityCategoryFunc(etm),
    )(body)
  }
}

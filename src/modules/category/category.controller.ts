import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser, Seller } from '../auth/auth.decorator'
import { ShopService } from '../seller/shop.service'
import { CategoryService } from './category.service'
import { ActiveToggleRequestDto, CreateCategoryRequestDto, OrderingCategoryRequestDto } from './dto/category.dto'

@Auth()
@Seller()
@Controller('v1/shops/categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly shopService: ShopService,
  ) {}

  @Get('/')
  @Transaction()
  async getCategories(
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.getCategoriesHandler(
      this.shopService.InquiryShopByMemberIdFunc(etm),
      this.categoryService.InquiryGetCategoriesFunc(etm),
    )(member)
  }

  @Post('/')
  @Transaction()
  async createCategory(
    @ReqUser() member: Member,
    @Body() body: CreateCategoryRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.createCategoryHandler(
      this.shopService.InquiryShopByMemberIdFunc(etm),
      this.categoryService.InquiryGetCategoriesFunc(etm),
      this.categoryService.InquiryInsertCategoryFunc(etm),
    )(member, body)
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

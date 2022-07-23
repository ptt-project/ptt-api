import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, Seller } from '../auth/auth.decorator'
import { CategoryService } from './category.service'

import {
  UpdateStatusCategoryRequestDto,
  CreateCategoryRequestDto,
  OrderingCategoryRequestDto,
  UpdateCategoryRequestDto,
} from './dto/category.dto'
import { getProductQueryDTO } from './dto/product.dto'
import { ProductService } from './product.service'

@Auth()
@Seller()
@Controller('v1/shops/categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

  @Get('/')
  @Transaction()
  async getCategories(
    @ReqShop() shop: Shop,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.getCategoriesHandler(
      this.categoryService.inquiryCategoriesFunc(etm),
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
      this.categoryService.inquiryCategoriesFunc(etm),
      this.categoryService.insertCategoryFunc(etm),
    )(shop, body)
  }

  @Patch(':categoryId/status')
  @Transaction()
  async updateStatusCategory(
    @Param('categoryId') categoryId: number,
    @Body() body: UpdateStatusCategoryRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.updateStatusCategoryHandler(
      this.categoryService.inquiryCategoryByCategoryIdFunc(etm),
      this.categoryService.updateStatusCategoryFunc(etm),
    )(categoryId, body)
  }

  @Patch('ordering')
  @Transaction()
  async orderingCategory(
    @ReqShop() shop: Shop,
    @Body() body: OrderingCategoryRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.orderingCategoryHandler(
      this.categoryService.inquiryCategoriesFunc(etm),
      this.categoryService.updatePriorityCategoryFunc(etm),
    )(shop, body)
  }

  @Put(':categoryId')
  @Transaction()
  async updateCategory(
    @Param('categoryId') categoryId: number,
    @Body() body: UpdateCategoryRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.updateCategoryHandler(
      this.productService.inquiryProductIdsByCategoryIdFunc(etm),
      this.productService.deleteCategoryProductToDb(etm),
      this.productService.insertCategoryProductToDbFunc(etm),
      this.categoryService.updateCategoryToDbFunc(etm),
      this.categoryService.inquiryCategoryByCategoryIdFunc(etm),
    )(categoryId, body)
  }

  @Get(':categoryId')
  @Transaction()
  async getCategory(
    @Param('categoryId') categoryId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.inquiryCategoryHandler(
      this.categoryService.inquiryCategoryByCategoryIdFunc(etm),
      this.productService.inquiryProductIdsByCategoryIdFunc(etm),
    )(categoryId)
  }

  @Delete(':categoryId')
  @Transaction()
  async deleteCategory(
    @Param('categoryId') categoryId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.categoryService.deleteCategoryHandler(
      this.categoryService.inquiryCategoryByCategoryIdFunc(etm),
      this.categoryService.deleteCategoryToDbFunc(etm),
      this.productService.deleteCategoryProductToDbByCategoryIdFunc(etm),
    )(categoryId)
  }

  @Get(':categoryId/products')
  @Transaction()
  async getProducts(
    @Param('categoryId') categoryId: number,
    @Query() query: getProductQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.inquiryProductByCatgoryIdHandler(
      this.productService.inquiryProductByCatgoryIdFunc(etm),
    )(categoryId, query)
  }
}

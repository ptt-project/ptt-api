import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser, Seller } from '../auth/auth.decorator'
import { ShopService } from '../seller/shop.service'
import { CategoryService } from './category.service'
import { CreateCategoryRequestDto } from './dto/category.dto'

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
}

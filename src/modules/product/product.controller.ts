import {
  Body,
  Controller,
  Post,
} from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, Seller } from '../auth/auth.decorator'
import { CreateProductProfileRequestDto } from './dto/product.dto'
import { ProductService } from './product.service'

@Auth()
@Seller()
@Controller('v1/shops/products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @Post('/')
  @Transaction()
  async createProduct(
    @ReqShop() shop: Shop,
    @Body() body: CreateProductProfileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.createProductHandler(
      this.productService.ValidateProductParamsFunc(etm),
      this.productService.InsertProductProfileToDbFunc(etm),
      this.productService.InsertProductOptionsToDbFunc(etm),
      this.productService.InsertProductsToDbFunc(etm),
      this.productService.InquiryProductProfileFromDbFunc(etm),
    )(shop, body)
  }
}

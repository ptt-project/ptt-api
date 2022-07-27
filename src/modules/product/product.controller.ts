import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqShop, Seller } from '../auth/auth.decorator'
import { CreateProductProfileRequestDto, UpdateProductProfileRequestDto } from './dto/product.dto'
import { ProductService } from './product.service'

@Auth()
@Seller()
@Controller('v1/shops')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @Post('products')
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

  @Get('products-profile/:productProfileId')
  @Transaction()
  async getProductByProductId(
    @Param('productProfileId') productProfileId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.getProductByProductIdHandler(
      this.productService.InquiryProductProfileByProductProfileIdFunc(etm),
      this.productService.InquiryProductOptionsByProductProfileIdFunc(etm),
      this.productService.InquiryProductsByProductProfileIdFunc(etm),
    )(productProfileId)
  }

  @Delete('products-profile/:productProfileId')
  @Transaction()
  async deleteProduct(
    @Param('productProfileId') productProfileId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.deleteProductByProductIdHandler(
      this.productService.InquiryProductProfileByProductProfileIdFunc(etm),
      this.productService.DeleteProductProfileByIdFunc(etm),
      this.productService.DeleteProductOptionsByIdFunc(etm),
      this.productService.DeleteProductsByIdFunc(etm),
    )(productProfileId)
  }

  @Patch('products-profile/:productProfileId/hidden/toggle')
  @Transaction()
  async hiddenToggleProduct(
    @Param('productProfileId') productProfileId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.hiddenToggleProductHandler(
      this.productService.InquiryProductProfileByProductProfileIdFunc(etm),
      this.productService.UpdateProductProfileStatusByProductProfileIdFunc(etm),
    )(productProfileId)
  }

  @Put('products-profile/:productProfileId')
  @Transaction()
  async updateProduct(
    @ReqShop() shop: Shop,
    @Param('productProfileId') productProfileId: number,
    @Body() body: UpdateProductProfileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.updateProductHandler(
      this.productService.ValidateProductParamsFunc(etm),
      this.productService.InquiryProductProfileByProductProfileIdFunc(etm),
      this.productService.InquiryProductOptionsByProductProfileIdFunc(etm),
      this.productService.InquiryProductsByProductProfileIdFunc(etm),
      this.productService.UpdateProductProfileByProductProfileIdFunc(etm),
      this.productService.UpdateProductByProductIdFunc(etm),
      this.productService.UpdateProductOptionByProductOptionIdFunc(etm),
      this.productService.InsertProductOptionsToDbFunc(etm),
      this.productService.InsertProductsToDbFunc(etm),
      this.productService.DeleteProductOptionsByIdFunc(etm),
      this.productService.DeleteProductsByIdFunc(etm),
      this.productService.RemoveProductByProductIdFunc(etm),
      this.productService.RemoveProductOptionByProductOptionIdFunc(etm),
    )(shop, productProfileId, body)
  }
}

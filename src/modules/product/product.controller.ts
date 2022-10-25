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
import {
  CreateProductProfileRequestDto,
  GetProductListDto,
  GetProductsDTO,
  UpdateProductProfileRequestDto,
} from './dto/product.dto'
import { ProductService } from './service/product.service'

@Auth()
@Seller()
@Controller('v1/shops')
export class ProductWithAuthController {
  constructor(private readonly productService: ProductService) {}

  @Post('products')
  @Transaction()
  async createProduct(
    @ReqShop() shop: Shop,
    @Body() body: CreateProductProfileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.CreateProductHandler(
      this.productService.ValidateProductParamsFunc(etm),
      this.productService.InsertProductProfileToDbFunc(etm),
      this.productService.InsertProductOptionsToDbFunc(etm),
      this.productService.InsertProductsToDbFunc(etm),
      this.productService.InquiryProductProfileByIdFromDbFunc(etm),
    )(shop, body)
  }

  @Get('products')
  @Transaction()
  async getProductList(
    @ReqShop() shop: Shop,
    @Query() query: GetProductListDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.GetProductByShopIdHandler(
      this.productService.InquiryProductListByShopIdFunc(etm),
    )(shop, query)
  }

  @Get('products-profile/:productProfileId')
  @Transaction()
  async getProductByProductId(
    @Param('productProfileId') productProfileId: string,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.GetProductByProductIdHandler(
      this.productService.InquiryProductProfileByProductProfileIdFunc(etm),
      this.productService.InquiryProductOptionsByProductProfileIdFunc(etm),
      this.productService.InquiryProductsByProductProfileIdFunc(etm),
    )(productProfileId)
  }

  @Delete('products-profile/:productProfileId')
  @Transaction()
  async deleteProduct(
    @Param('productProfileId') productProfileId: string,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.DeleteProductByProductIdHandler(
      this.productService.InquiryProductProfileByProductProfileIdFunc(etm),
      this.productService.DeleteProductProfileByIdFunc(etm),
      this.productService.DeleteProductOptionsByIdFunc(etm),
      this.productService.DeleteProductsByIdFunc(etm),
    )(productProfileId)
  }

  @Patch('products-profile/:productProfileId/hidden/toggle')
  @Transaction()
  async hiddenToggleProduct(
    @Param('productProfileId') productProfileId: string,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.HiddenToggleProductHandler(
      this.productService.InquiryProductProfileByProductProfileIdFunc(etm),
      this.productService.UpdateProductProfileStatusByProductProfileIdFunc(etm),
    )(productProfileId)
  }

  @Put('products-profile/:productProfileId')
  @Transaction()
  async updateProduct(
    @ReqShop() shop: Shop,
    @Param('productProfileId') productProfileId: string,
    @Body() body: UpdateProductProfileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.UpdateProductHandler(
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

@Controller('v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  @Transaction()
  async getProducts(
    @Query() query: GetProductsDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.InquiryProductProfileHandler(
      this.productService.InquiryProductProfileFromDbFunc(etm),
    )(query)
  }
}

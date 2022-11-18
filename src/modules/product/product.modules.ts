import { Module } from '@nestjs/common'

import {
  ProductController,
  ProductWithAuthController,
} from './product.controller'
import { ProductService } from './service/product.service'

@Module({
  controllers: [ProductWithAuthController, ProductController],
  providers: [ProductService],
  exports: [],
})
export class ProductModule {}

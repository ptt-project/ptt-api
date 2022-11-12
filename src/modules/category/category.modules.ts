import { Module } from '@nestjs/common'
import { ShopService } from '../shop/service/shop.service'

import { CategoryController } from './category.controller'
import { CategoryService } from './service/category.service'
import { ProductService } from './service/product.service'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ShopService, ProductService],
  exports: [],
})
export class CategoryModule {}

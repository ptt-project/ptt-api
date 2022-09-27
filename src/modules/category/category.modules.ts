import { Module } from '@nestjs/common'
import { ShopService } from '../seller/service/shop.service'

import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { ProductService } from './product.service'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ShopService, ProductService],
  exports: [],
})
export class CategoryModule {}

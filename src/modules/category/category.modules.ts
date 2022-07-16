import { Module } from '@nestjs/common'
import { ShopService } from '../seller/shop.service'

import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ShopService],
  exports: [],
})
export class CategoryModule {}

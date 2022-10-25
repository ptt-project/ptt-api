import { Module } from '@nestjs/common'

import { ProductController } from './product.controller'
import { ProductService } from './service/product.service'

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [],
})
export class ProductModule {}

import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { EntityManager } from 'typeorm'
import { InquiryProductByIdType } from '../type/order.type'
import { Product } from 'src/db/entities/Product'
import dayjs from 'dayjs'

@Injectable()
export class ProductService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ProductService.name)
  }

  InquiryProductByIdFunc(etm: EntityManager): InquiryProductByIdType {
    return async (productId: string): Promise<[Product, string]> => {
      const start = dayjs()
      let product: Product
      try {
        product = await etm.findOne(Product, productId, {
          withDeleted: false,
          relations: ['productProfile'],
        })
      } catch (error) {
        return [product, error.message]
      }

      if (!product) {
        return [product, 'Not found product']
      }

      if (product.stock <= 0) {
        return [product, 'Product out of stock']
      }

      if (product.productProfile.status != 'public') {
        return [product, 'Product is not available']
      }

      this.logger.info(`Done InquiryProductByIdFunc ${dayjs().diff(start)} ms`)
      return [product, '']
    }
  }
}

import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { EntityManager } from 'typeorm'
import {
  InquiryProductByIdType,
  InquiryProducProfiletByIdType,
  InquiryProductByIdParams,
} from '../type/product.type'
import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import dayjs from 'dayjs'

@Injectable()
export class ProductService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ProductService.name)
  }

  InquiryProductByIdFunc(etm: EntityManager): InquiryProductByIdType {
    return async (
      params: InquiryProductByIdParams,
    ): Promise<[Product, string]> => {
      const start = dayjs()

      const { productId, productOptions1, productOptions2 } = params
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

      const { stock, productProfile, option1, option2 } = product

      if (stock <= 0) {
        return [product, 'Product out of stock']
      }

      if (productProfile.status != 'public') {
        return [product, 'Product is not available']
      }

      if (productOptions1 && productOptions1 != option1) {
        return [product, 'Params productOptions1 invalid']
      }

      if (productOptions2 && productOptions2 != option2) {
        return [product, 'Params productOptions2 invalid']
      }

      this.logger.info(`Done InquiryProductByIdFunc ${dayjs().diff(start)} ms`)
      return [product, '']
    }
  }

  InquiryProductProfileByIdFunc(
    etm: EntityManager,
  ): InquiryProducProfiletByIdType {
    return async (
      productProfileId: string,
    ): Promise<[ProductProfile, string]> => {
      const start = dayjs()
      let productProfile: ProductProfile
      try {
        productProfile = await etm.findOne(ProductProfile, productProfileId, {
          withDeleted: false,
        })
      } catch (error) {
        return [productProfile, error.message]
      }

      if (!productProfile) {
        return [productProfile, 'Not found productProfile']
      }

      this.logger.info(
        `Done InquiryProductProfileByIdFunc ${dayjs().diff(start)} ms`,
      )
      return [productProfile, '']
    }
  }
}

import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { EntityManager } from 'typeorm'
import { Shop } from 'src/db/entities/Shop'
import dayjs from 'dayjs'
import { InquiryShopByIdType } from '../type/order.type'

@Injectable()
export class ShopService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ShopService.name)
  }

  InquiryShopByIdFunc(etm: EntityManager): InquiryShopByIdType {
    return async (shopId: string): Promise<[Shop, string]> => {
      const start = dayjs()
      let shop: Shop
      try {
        shop = await etm.findOne(Shop, shopId, { withDeleted: false })
      } catch (error) {
        return error.message
      }

      if (!shop) {
        return [, 'Not found shop']
      }

      if (shop.approvalStatus != 'approved') {
        return [, 'Shop status is not apporved']
      }

      this.logger.info(`Done InquiryShopByIdFunc ${dayjs().diff(start)} ms`)
      return [shop, '']
    }
  }
}

import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Condition } from 'src/db/entities/Condition'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager } from 'typeorm'
import { UnableToGetConditions } from 'src/utils/response-code'
import { InquiryConditionByShopIdType, InsertConditionToDbFuncType } from '../type/condition.type'

@Injectable()
export class ConditionService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ConditionService.name)
  }

  GetConditionsHandler(inquiryConditionByShopId: Promise<InquiryConditionByShopIdType>) {
    return async (shop: Shop) => {
      const start = dayjs()

      const [condition, InquiryConditionByShopIdError] = await (await inquiryConditionByShopId)(
        shop.id,
      )

      if (InquiryConditionByShopIdError != '') {
        return response(undefined, UnableToGetConditions, InquiryConditionByShopIdError)
      }

      this.logger.info(`Done GetConditionsHandler ${dayjs().diff(start)} ms`)
      return response(condition)
    }
  }

  async InquiryConditionByShopIdFunc(
    etm: EntityManager,
  ): Promise<InquiryConditionByShopIdType> {
    return async (shopId: string): Promise<[Condition, string]> => {
      const start = dayjs()
      let condition: Condition
      try {
        condition = await etm.findOne(Condition, {
          where: { shopId, deletedAt: null },
        })
        if (!condition) {
          return [condition, 'Unable to get conditions for this shop']
        }
      } catch (error) {
        return [condition, error.message]
      }

      this.logger.info(`Done InquiryConditionByShopIdFunc ${dayjs().diff(start)} ms`)
      return [condition, '']
    }
  }

  async InsertConditionToDbFunc(
    etm: EntityManager,
  ): Promise<InsertConditionToDbFuncType> {
    return async (shop: Shop): Promise<[Condition, string]> => {
      const start = dayjs()
      let condition: Condition
      try {
        condition = etm.create(Condition, {
          shopId: shop.id,
        })
        
        condition = await etm.save(condition)
        shop.condition = condition
        await etm.save(shop)
      } catch (error) {
        return [condition, error.message]
      }

      this.logger.info(`Done InsertConditionToDbFunc ${dayjs().diff(start)} ms`)
      return [condition, '']
    }
  }
}

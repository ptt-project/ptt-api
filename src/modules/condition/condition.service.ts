import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Condition } from 'src/db/entities/Condition'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager } from 'typeorm'
import { InquiryConditionByShopIdType } from './condition.type'
import { UnableToGetConditions } from 'src/utils/response-code'

@Injectable()
export class ConditionService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ConditionService.name)
  }

  GetConditionsHandler(inquiryConditionByShopIdFunc: Promise<InquiryConditionByShopIdType>) {
    return async (shop: Shop) => {
      const start = dayjs()

      const [condition, InquiryConditionByShopIdError] = await (await inquiryConditionByShopIdFunc)(
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
    return async (shopId: number): Promise<[Condition, string]> => {
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
        return [condition, error]
      }

      this.logger.info(`Done InquiryConditionByShopIdFunc ${dayjs().diff(start)} ms`)
      return [condition, '']
    }
  }

}

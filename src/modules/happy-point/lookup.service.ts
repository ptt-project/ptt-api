import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { HappyPointLookup } from 'src/db/entities/HappyPointLookup'
import { Member } from 'src/db/entities/Member'
import { genUuid } from 'src/utils/helpers'
import { EntityManager } from 'typeorm'
import {
  InsertLookupToDbType,
  InsertLookupToDbParams,
  LookupExchangeRageType,
} from './happy-point.type'
import { InquiryCurrentExchangeRateFromDbType } from '../exchange-rate/exchange-rate.type'
import { UnableInsertLookupToDb } from 'src/utils/response-code'
import { response } from 'src/utils/response'

@Injectable()
export class LookupService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LookupService.name)
  }

  LookupHandler(
    inquiryCurrentExchangeRateFromDb: Promise<
      InquiryCurrentExchangeRateFromDbType
    >,
    insertLookup: Promise<InsertLookupToDbType>,
  ) {
    return async (member: Member) => {
      const exchangeRate = await (await inquiryCurrentExchangeRateFromDb)()
      const paramsInsertLookup: InsertLookupToDbParams = {
        exchangeRate,
        memberId: member.id,
      }
      const [happyPointLookup, isErrorInsertLookup] = await (
        await insertLookup
      )(paramsInsertLookup)

      if (isErrorInsertLookup != '') {
        return response(undefined, UnableInsertLookupToDb, isErrorInsertLookup)
      }

      const { refId } = happyPointLookup
      return response({ refId, exchangeRate })
    }
  }

  async InsertLookupToDbFunc(
    etm: EntityManager,
  ): Promise<InsertLookupToDbType> {
    return async (params: InsertLookupToDbParams) => {
      const { memberId, exchangeRate } = params
      let happyPointLookup: HappyPointLookup

      try {
        happyPointLookup = etm.create(HappyPointLookup, {
          memberId,
          exchangeRate,
          refId: genUuid(),
        })
        await etm.save(happyPointLookup)
      } catch (error) {
        return [happyPointLookup, error]
      }

      return [happyPointLookup, '']
    }
  }

  async LookupExchangeRageFunc(
    etm: EntityManager,
  ): Promise<LookupExchangeRageType> {
    return async (refId: string) => {
      let happyPointLookup: HappyPointLookup

      try {
        happyPointLookup = await etm.findOne(HappyPointLookup, {
          where: { refId },
        })
      } catch (error) {
        return [0, error]
      }

      if (!happyPointLookup) {
        return [0, 'HappyPointLookup not found']
      }

      return [happyPointLookup.exchangeRate, '']
    }
  }
}

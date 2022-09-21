import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { EntityManager } from 'typeorm'
import { InquiryRefIdExistInTransactionType } from '../type/happy-point.type'
import { InquiryMasterConfigType } from '../../master-config/type/master-config.type'
import {
  UnableInquiryMasterConfig,
  UnableInsertLookupToDb,
} from 'src/utils/response-code'
import { response } from 'src/utils/response'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { HappyPointTransaction } from 'src/db/entities/HappyPointTransaction'
import { Redis } from 'ioredis'
import {
  Lookup,
  SetCacheLookupToRedisFunc,
  GetCacheLookupToRedisType,
} from '../type/lookup.type'
import {
  genUuid,
  getCacheObjectToRedis,
  setCacheObjectToRedis,
} from 'src/utils/helpers'

@Injectable()
export class LookupService {
  preFixKeyLookup = 'HappyPoint:Lookup:'
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LookupService.name)
  }

  LookupHandler(
    inquiryMasterConfig: Promise<InquiryMasterConfigType>,
    setCacheLookupToRedis: Promise<SetCacheLookupToRedisFunc>,
  ) {
    return async (happyPoint: HappyPoint) => {
      const [masterConfig, isErrorInquiryMasterConfig] = await (
        await inquiryMasterConfig
      )()
      if (isErrorInquiryMasterConfig != '') {
        return response(
          undefined,
          UnableInquiryMasterConfig,
          isErrorInquiryMasterConfig,
        )
      }
      const {
        exchangeRate,
        happyPointBuyRate,
        happyPointSellRate,
        happyPointFeePercent,
        happyPointTransferRate,
      } = masterConfig.config

      const params: Lookup = {
        happyPointBuyRate,
        happyPointSellRate,
        happyPointFeePercent,
        happyPointTransferRate,
        refId: genUuid(),
        happyPointId: happyPoint.id,
      }

      console.log('=== debug ===', params)

      const isErrorsetCacheLookupToRedis = await (await setCacheLookupToRedis)(
        params,
      )

      if (isErrorsetCacheLookupToRedis != '') {
        return response(
          undefined,
          UnableInsertLookupToDb,
          isErrorsetCacheLookupToRedis,
        )
      }

      const { refId } = params
      return response({ refId, exchangeRate })
    }
  }

  async GetCacheLookupToRedisFunc(
    redis: Redis,
  ): Promise<GetCacheLookupToRedisType> {
    return async (refId: string): Promise<[Lookup, string]> => {
      const key = this.preFixKeyLookup + refId
      const data = (await getCacheObjectToRedis(redis, key)) as Lookup

      if (!data) {
        return [data, `RefId: ${refId} not found.`]
      }

      return [data, '']
    }
  }

  async SetCacheLookupToRedisFunc(
    redis: Redis,
  ): Promise<SetCacheLookupToRedisFunc> {
    return async (params: Lookup): Promise<string> => {
      try {
        const key = this.preFixKeyLookup + params.refId
        await setCacheObjectToRedis(redis, key, JSON.stringify(params), 60 * 15)
      } catch (error) {
        return error
      }

      return ''
    }
  }

  async InquiryRefIdExistInTransactionFunc(
    etm: EntityManager,
  ): Promise<InquiryRefIdExistInTransactionType> {
    return async (refId: string): Promise<[number, string]> => {
      try {
        const tranaction = await etm.findOne(HappyPointTransaction, {
          withDeleted: false,
          where: { refId },
        })

        if (tranaction) {
          return [200, `RefId: ${refId} already exists.`]
        }
      } catch (error) {
        return [500, error]
      }

      return [200, '']
    }
  }
}

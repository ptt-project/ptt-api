import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { InquiryRefIdExistInTransactionType } from '../type/wallet.type'
import { InquiryMasterConfigType } from '../../master-config/type/master-config.type'
import {
  UnableInquiryMasterConfig,
  UnableInsertLookupToDb,
} from 'src/utils/response-code'
import { response } from 'src/utils/response'
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
import { Wallet } from 'src/db/entities/Wallet'
import { EntityManager } from 'typeorm'
import { WalletTransactionReference } from 'src/db/entities/WalletTransactionReference'

@Injectable()
export class WalletLookupService {
  preFixKeyLookup = 'Wallet:Lookup:'
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(WalletLookupService.name)
  }

  LookupHandler(
    inquiryMasterConfig: Promise<InquiryMasterConfigType>,
    setCacheLookupToRedis: Promise<SetCacheLookupToRedisFunc>,
  ) {
    return async (wallet: Wallet) => {
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
        eWalletWithdrawFeeRate,
      } = masterConfig.config

      const params: Lookup = {
        eWalletWithdrawFeeRate,
        refId: genUuid(),
        walletId: wallet.id,
      }

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
      return response({
        refId,
        eWalletWithdrawFeeRate,
      })
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
        const tranaction = await etm.findOne(WalletTransactionReference, {
          withDeleted: false,
          where: { referenceNo: refId },
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

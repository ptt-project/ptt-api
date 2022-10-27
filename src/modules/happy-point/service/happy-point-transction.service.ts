import { Injectable } from '@nestjs/common'

import { PinoLogger } from 'nestjs-pino'
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import {
  HappyPointTransaction,
  HappyPointTransactionType,
} from 'src/db/entities/HappyPointTransaction'
import { response } from 'src/utils/response'
import { UnableInquiryHappyPointTransactionToDb } from 'src/utils/response-code'
import { EntityManager, SelectQueryBuilder } from 'typeorm'
import { GetHappyPointHistoryDto } from '../dto/happy-point-transaction'
import {
  InquiryHappyPointTransactionToDbType,
  ResponseHappyPointTransctionToHistoryType,
} from '../type/happy-point-transaction.type'

@Injectable()
export class HappyPointTransactionService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(HappyPointTransactionService.name)
  }

  GetHappyPointHistory(
    inquiryHappyPointTransactionToDb: InquiryHappyPointTransactionToDbType,
    responseHappyPointTransctionToHistory: ResponseHappyPointTransctionToHistoryType,
  ) {
    return async (happyPoint: HappyPoint, body: GetHappyPointHistoryDto) => {
      const { filter, limit = 10, page = 1 } = body
      const [
        builderHappyPointTransaction,
        errorInquiryHappyPointTransactionToDb,
      ] = inquiryHappyPointTransactionToDb(happyPoint.id, filter)
      if (errorInquiryHappyPointTransactionToDb != '') {
        return response(
          undefined,
          UnableInquiryHappyPointTransactionToDb,
          errorInquiryHappyPointTransactionToDb,
        )
      }

      const happyPointTransactions = await paginate<HappyPointTransaction>(
        builderHappyPointTransaction,
        {
          limit,
          page,
        },
      )
      const result = responseHappyPointTransctionToHistory(
        happyPointTransactions,
      )

      return response(result)
    }
  }

  InquiryHappyPointTransactionToDbFunc(
    etm: EntityManager,
  ): InquiryHappyPointTransactionToDbType {
    return (
      happyPointId: number,
      filter?: HappyPointTransactionType,
    ): [SelectQueryBuilder<HappyPointTransaction>, string] => {
      let happyPointTransaction: SelectQueryBuilder<HappyPointTransaction>

      try {
        happyPointTransaction = etm
          .createQueryBuilder(HappyPointTransaction, 'happyPointTransactions')
          .leftJoinAndMapOne(
            'happyPointTransactions.toHappyPoint',
            'happyPointTransactions.toHappyPoint',
            'toHappyPoints',
          )
          .leftJoinAndMapOne(
            'toHappyPoints.member',
            'toHappyPoints.member',
            'members',
          )
          .where('happyPointTransactions.fromHappyPointId = :happyPointId', {
            happyPointId,
          })
          .andWhere('happyPointTransactions.deletedAt IS NULL')
          .orderBy('happyPointTransactions.createdAt', 'DESC')

        if (filter) {
          happyPointTransaction.andWhere(
            'happyPointTransactions.type = :filter',
            {
              filter,
            },
          )
        }
      } catch (error) {
        return [happyPointTransaction, error.message]
      }

      return [happyPointTransaction, '']
    }
  }

  ResponseHappyPointTransctionToHistoryFunc(): ResponseHappyPointTransctionToHistoryType {
    return (
      happyPointTransactions: Pagination<
        HappyPointTransaction,
        IPaginationMeta
      >,
    ): Pagination<any, IPaginationMeta> => {
      const result = happyPointTransactions.items.map(
        (happyPointTransaction: HappyPointTransaction, index: number) => {
          console.log('index =>', index + 1)
          const { toHappyPoint } = happyPointTransaction
          let memberRemark = null

          if (happyPointTransaction.type == 'TRANSFER') {
            const { member } = toHappyPoint
            memberRemark = member
              ? { username: member.username, firstName: member.firstName }
              : null
          }

          return {
            ...happyPointTransaction,
            memberRemark,
            toHappyPoint: undefined,
          }
        },
      )

      return { ...happyPointTransactions, items: result }
    }
  }
}

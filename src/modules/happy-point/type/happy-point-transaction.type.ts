import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import {
  HappyPointTransaction,
  HappyPointTransactionType,
} from 'src/db/entities/HappyPointTransaction'
import { SelectQueryBuilder } from 'typeorm'

export type InquiryHappyPointTransactionToDbType = (
  happyPointId: string,
  filter?: HappyPointTransactionType,
) => [SelectQueryBuilder<HappyPointTransaction>, string]

export type ResponseHappyPointTransctionToHistoryType = (
  happyPointTransaction: Pagination<HappyPointTransaction, IPaginationMeta>,
) => Pagination<HappyPointTransaction, IPaginationMeta>

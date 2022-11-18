import { Dayjs } from 'dayjs'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import {
  HappyPointTransaction,
  HappyPointTransactionType,
} from 'src/db/entities/HappyPointTransaction'
import { SelectQueryBuilder } from 'typeorm'

export type InquiryHappyPointTransactionToDbType = (
  happyPointId: string,
  filter?: HappyPointTransactionType,
  startDate?: Dayjs,
  endDate?: Dayjs,
) => [SelectQueryBuilder<HappyPointTransaction>, string]

export type ResponseHappyPointTransctionToHistoryType = (
  happyPointTransaction: Pagination<HappyPointTransaction, IPaginationMeta>,
) => Pagination<HappyPointTransaction, IPaginationMeta>

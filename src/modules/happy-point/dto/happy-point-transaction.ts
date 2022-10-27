import { IsIn, IsOptional } from 'class-validator'
import { HappyPointTransactionType } from 'src/db/entities/HappyPointTransaction'

export class GetHappyPointHistoryDto {
  @IsOptional()
  @IsIn(['BUY', 'SELL', 'TRANSFER'])
  filter?: HappyPointTransactionType

  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number
}

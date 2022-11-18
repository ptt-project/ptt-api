import { IsIn, IsOptional, Validate } from 'class-validator'
import { HappyPointTransactionType } from 'src/db/entities/HappyPointTransaction'
import { Transform } from 'class-transformer'
import dayjs, { Dayjs } from 'dayjs'
import { ValidateDayjs } from 'src/utils/validate-dto'

export class GetHappyPointHistoryDto {
  @IsOptional()
  @IsIn(['BUY', 'SELL', 'TRANSFER'])
  filter?: HappyPointTransactionType

  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @Validate(ValidateDayjs)
  @Transform(({ value }) => {
    return dayjs(value)
  })
  startDate?: Dayjs

  @IsOptional()
  @Validate(ValidateDayjs)
  @Transform(({ value }) => {
    return dayjs(value)
  })
  endDate?: Dayjs
}

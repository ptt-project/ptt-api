import {  IsDate, IsDateString, IsOptional, IsString } from 'class-validator'
import { TransactionType } from 'src/db/entities/WalletTransaction'
import { Transform } from 'class-transformer'


export class getWalletTransactionQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
  })
  startDate?: Date

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value)
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    date.setDate(date.getDate() + 1)
    return date
  })
  endDate?: Date

  @IsOptional()
  @IsString()
  type?: TransactionType
}
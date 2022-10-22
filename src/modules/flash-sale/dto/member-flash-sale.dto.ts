
import {  IsOptional } from 'class-validator'

export class GetMemberFlashSaleQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number
}

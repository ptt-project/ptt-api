import { IsBooleanString, IsIn, IsOptional } from "class-validator"

export class getHappyPointTransactionQueryDTO {
    @IsOptional()
    limit?: number
  
    @IsOptional()
    page?: number

    @IsOptional()
    @IsIn(['SELL', 'BUY', 'TRANSFER'])
    type?: string

  }
  
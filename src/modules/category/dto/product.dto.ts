import { IsNotEmpty, IsOptional } from 'class-validator'
import { Double } from 'typeorm'

export class getProductQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @IsNotEmpty()
  q?: string
}

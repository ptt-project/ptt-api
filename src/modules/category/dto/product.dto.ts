import { IsOptional } from 'class-validator'

export class getProductQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number
}

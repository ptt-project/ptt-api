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

export class GetProductByShopIdQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @IsNotEmpty()
  productName?: string

  @IsOptional()
  @IsNotEmpty()
  minPrice?: Double

  @IsOptional()
  @IsNotEmpty()
  maxPrice?: Double
}
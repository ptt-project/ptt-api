import { IsJSON, IsNotEmpty, IsOptional } from 'class-validator'

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
  minPrice?: number

  @IsOptional()
  @IsNotEmpty()
  maxPrice?: number

  @IsOptional()
  @IsNotEmpty()
  @IsJSON()
  categories?: string
}
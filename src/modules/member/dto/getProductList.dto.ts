import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class GetProductListMemberDto {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  categoryId?: number

  @IsOptional() 
  keyword: string
}

export class GetProductInfoMemberDto {
  @IsNotEmpty()
  @IsArray()
  productIds: number[]
}

export class ProductShipping {
  @IsNotEmpty()
  @IsNumber()
  productId: string

  @IsNotEmpty()
  @IsNumber()
  productUnits: number
}

export class ShopShipping {
  @IsNotEmpty()
  @IsNumber()
  shopId: string

  @IsNotEmpty()
  @IsArray()
  products: ProductShipping[]
}

export class GetProductShipingDto {
  @IsNotEmpty()
  @IsString()
  addressId: string

  @IsNotEmpty()
  @IsArray()
  shops: ShopShipping[]
}
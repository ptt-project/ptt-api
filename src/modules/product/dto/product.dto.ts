import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { ConditionType } from 'src/db/entities/ProductProfile'

export class CreateProductOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @ArrayNotEmpty()
  options: string[]
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  option1: string

  @IsString()
  @IsOptional()
  option2?: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  @IsNumber()
  @IsNotEmpty()
  stock: number

  @IsString()
  @IsOptional()
  sku?: string
}

export class CreateProductProfileRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  detail: string

  @IsNumber()
  @IsNotEmpty()
  platformCategoryId: number

  @IsNumber()
  @IsOptional()
  brandId?: number

  @IsNumber()
  @IsNotEmpty()
  weight: number

  @IsNumber()
  @IsOptional()
  exp?: number

  @IsString()
  @IsOptional()
  condition?: ConditionType

  @IsBoolean()
  @IsOptional()
  isSendLated?: boolean

  @IsNumber()
  @IsOptional()
  extraDay?: number

  @IsString()
  @IsOptional()
  videoLink?: string

  @IsArray()
  @IsOptional()
  imageIds?: string[]

  @IsArray()
  @ArrayNotEmpty()
  products: CreateProductDto[]

  @IsArray()
  @ArrayNotEmpty()
  productOptions: CreateProductOptionDto[]

}
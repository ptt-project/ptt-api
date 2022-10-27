import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import {
  ConditionType,
  ProductProfileStatusType,
} from 'src/db/entities/ProductProfile'

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

export class GetProductListDto {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @IsBooleanString()
  approval?: string

  @IsOptional()
  @IsIn(['public', 'hidden', 'out of stock'])
  status: ProductProfileStatusType

  @IsOptional()
  categoryId?: number

  @IsOptional()
  @IsIn(['product name', 'sku', 'product option'])
  groupSearch: string

  @IsOptional()
  keyword: string
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
  platformCategoryId: string

  @IsNumber()
  @IsOptional()
  brandId?: string

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
  @IsOptional()
  products?: CreateProductDto[]

  @IsArray()
  @IsOptional()
  productOptions?: CreateProductOptionDto[]

  @IsBoolean()
  @IsNotEmpty()
  isMultipleOptions: boolean

  @IsNumber()
  @IsOptional()
  price?: number

  @IsNumber()
  @IsOptional()
  stock?: number

  @IsString()
  @IsOptional()
  sku?: string

  @IsNumber()
  @IsNotEmpty()
  width: number

  @IsNumber()
  @IsNotEmpty()
  length: number

  @IsNumber()
  @IsNotEmpty()
  height: number
}

export class UpdateProductProfileRequestDto {
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
  platformCategoryId: string

  @IsOptional()
  @IsNumber()
  brandId?: string

  @IsNumber()
  @IsNotEmpty()
  weight: number

  @IsOptional()
  @IsNumber()
  exp?: number

  @IsOptional()
  @IsString()
  condition?: ConditionType

  @IsOptional()
  @IsBoolean()
  isSendLated?: boolean

  @IsOptional()
  @IsNumber()
  extraDay?: number

  @IsOptional()
  @IsString()
  videoLink?: string

  @IsOptional()
  @IsArray()
  imageIds?: string[]

  @IsOptional()
  @IsArray()
  products?: UpdateProductDto[]

  @IsOptional()
  @IsArray()
  productOptions?: UpdateProductOptionDto[]

  @IsNotEmpty()
  @IsBoolean()
  isMultipleOptions: boolean

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsNumber()
  stock?: number

  @IsOptional()
  @IsString()
  sku?: string

  @IsNumber()
  @IsNotEmpty()
  width: number

  @IsNumber()
  @IsNotEmpty()
  length: number

  @IsNumber()
  @IsNotEmpty()
  height: number
}

export class UpdateProductOptionDto {
  @IsString()
  @IsOptional()
  id: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @ArrayNotEmpty()
  options: string[]
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  id: string

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

import { Transform, Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { DiscountType } from 'src/db/entities/ProductProfilePromotion'
import { IsArrayOfObjects } from 'src/utils/decorator/dto.decorator'

export class CreateProductProfilePromotionDTO {
  @IsNumber()
  @IsNotEmpty()
  productProfileId: number

  @IsIn(['value', 'percentage'])
  @IsNotEmpty()
  discountType: DiscountType

  @IsNumber()
  @IsNotEmpty()
  discount: number

  @IsBoolean()
  @IsNotEmpty()
  isLimitToStock: boolean

  @IsBoolean()
  @IsNotEmpty()
  isLimitToBuy: boolean

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean
}

export class CreatePromotionRequestDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    const date = new Date(value)
    return date
  })
  startDate: Date

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    const date = new Date(value)
    return date
  })
  endDate: Date

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateProductProfilePromotionDTO)
  @IsArrayOfObjects()
  @ValidateNested()
  productProfiles: CreateProductProfilePromotionDTO[]
}

export class GetPromotionQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number
  
  @IsString()
  @IsOptional()
  name?: string

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value
    const date = new Date(value)
    return date
  })
  startDate?: Date

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value
    const date = new Date(value)
    return date
  })
  endDate?: Date
}
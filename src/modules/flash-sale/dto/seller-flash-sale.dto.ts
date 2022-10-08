import { Transform, Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { StatusType } from 'src/db/entities/FlashSale'
import { DiscountType } from 'src/db/entities/FlashSaleProductProfile'
// import { IsArrayOfObjects } from 'src/utils/decorator/dto.decorator'

export class CreateFlashSaleProductProfileDTO {
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
  isLimitToStock?: number

  @IsBoolean()
  @IsNotEmpty()
  isLimitToBuy?: number

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean
}

export class CreateFlashSaleRequestDTO {
  @IsNumber()
  @IsNotEmpty()
  roundId: number

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateFlashSaleProductProfileDTO)
  // @IsArrayOfObjects()
  // @ValidateNested()
  productProfiles: CreateFlashSaleProductProfileDTO[]
}

export class GetFlashSaleQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number
  
  @IsString()
  @IsOptional()
  @IsIn(['active', 'expired'])
  status?: string

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value
    const date = new Date(value)
    return date
  })
  date?: Date
}

export class GetFlashSaleRoundDTO {
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (!value) return value
    const date = new Date(value)
    return date
  })
  date: Date
}

export class UpdateStatusFlashSaleRequestDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn(['active', 'inactive'])
  status: StatusType
}

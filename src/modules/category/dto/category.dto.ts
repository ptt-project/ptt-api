import {
  ArrayNotEmpty,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator'
import { StatusType } from 'src/db/entities/Category'

export class CreateCategoryRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string
}

export class UpdateStatusCategoryRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['active', 'inactive'])
  status: StatusType
}

export class OrderingCategoryRequestDto {
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  orders: number[]
}

export class UpdateCategoryRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string

  @IsNotEmpty()
  productProfileIds: number[]
}

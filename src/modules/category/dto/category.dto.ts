import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsNumber, IsNumberString, IsString, MaxLength } from 'class-validator'
import { StatusType } from 'src/db/entities/Category'
import { ShopType } from 'src/db/entities/Shop'

export class CreateCategoryRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: ShopType
}

export class ActiveToggleRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['active', 'inactive'])
  status: StatusType
}

export class OrderingCategoryRequestDto {
  @ArrayNotEmpty()
  @IsNumber({},{each: true})
  orders: number[]
}
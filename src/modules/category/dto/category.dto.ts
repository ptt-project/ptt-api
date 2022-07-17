import { IsBoolean, IsBooleanString, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator'
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
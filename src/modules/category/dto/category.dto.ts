import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { ShopType } from 'src/db/entities/Shop'

export class CreateCategoryRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: ShopType
}

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ShopType } from 'src/db/entities/Shop'

export class RegisterSellerRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: ShopType

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  fullName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mobile: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  email: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  brandName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string

  @IsOptional()
  @MaxLength(50)
  website?: string

  @IsOptional()
  @MaxLength(50)
  facebookPage?: string

  @IsOptional()
  @MaxLength(50)
  instagram?: string

  @IsOptional()
  @MaxLength(200)
  socialMedia?: string

  @IsOptional()
  @MaxLength(1000)
  note?: string

  @IsOptional()
  @MaxLength(20)
  corperateId?: string

  @IsOptional()
  @MaxLength(50)
  corperateName?: string
}

export class UpdateShopInfoRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  shopName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  shopDescription: string
}

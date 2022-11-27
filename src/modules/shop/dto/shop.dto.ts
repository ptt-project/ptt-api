import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateShopInfoRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  shopName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  shopDescription: string

  @IsOptional()
  @IsString()
  profileImagePath?: string

  @IsOptional()
  @IsString()
  coverImagePath?: string
}

export class SearchShopsDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsNotEmpty()
  keyword: string
}
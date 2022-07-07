import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAddressRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  province: string

  @IsString()
  @IsNotEmpty()
  tambon: string

  @IsString()
  @IsNotEmpty()
  district: string

  @IsString()
  @IsNotEmpty()
  postcode: string

  @IsOptional()
  address?: string

  @IsOptional()
  geoName?: string

  @IsOptional()
  isMain?: boolean

  @IsOptional()
  isHome?: boolean

  @IsOptional()
  isWork?: boolean
}

export class MemberUpdateAddressRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  province: string

  @IsString()
  @IsNotEmpty()
  tambon: string

  @IsString()
  @IsNotEmpty()
  district: string

  @IsString()
  @IsNotEmpty()
  postcode: string

  @IsOptional()
  address?: string

  @IsOptional()
  geoName?: string

  @IsOptional()
  isMain?: boolean

  @IsOptional()
  isHome?: boolean

  @IsOptional()
  isWork?: boolean
}

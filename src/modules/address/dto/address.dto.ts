import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class GeoNameRequest {
  @IsOptional()
  lat: number

  @IsOptional()
  lng: number
}

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
  geoName?: GeoNameRequest

  @IsOptional()
  isMain?: boolean

  @IsOptional()
  isHome?: boolean

  @IsOptional()
  isWork?: boolean

  @IsOptional()
  isPickup?: boolean

  @IsOptional()
  isReturnItem?: boolean
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
  geoName?: GeoNameRequest

  @IsOptional()
  isMain?: boolean

  @IsOptional()
  isHome?: boolean

  @IsOptional()
  isWork?: boolean

  @IsOptional()
  isPickup?: boolean

  @IsOptional()
  isReturnItem?: boolean
}

import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class addMobileRequestDto {
  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

export class addMobileRegisterDto {
  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsNotEmpty()
  isPrimary: boolean
}

export class setMainMobileRequestDto {
  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

export class deleteMobileRequestDto {
  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

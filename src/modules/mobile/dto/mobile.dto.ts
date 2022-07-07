import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class addMobileRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
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
  @MaxLength(10)
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
  @MaxLength(10)
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
  @MaxLength(10)
  mobile: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

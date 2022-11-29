import { IsNotEmpty, IsString, IsEmail, IsBoolean, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mobile: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string

  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsNotEmpty()
  pdpaStatus: boolean

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

export class ValidateRegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mobile: string
}

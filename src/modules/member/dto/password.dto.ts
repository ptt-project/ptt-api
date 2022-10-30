import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class ResetPasswordEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  loginToken: string

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}

export class ResetPasswordMobileRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mobile: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

export class ForgotPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string
}

export class ChagnePasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @IsString()
  @IsNotEmpty()
  newPassword: string
}

import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

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
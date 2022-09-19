import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class ResetPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsOptional()
  @IsString()
  otpCode: string

  @IsOptional()
  @IsString()
  refCode: string
}
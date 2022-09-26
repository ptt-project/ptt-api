import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

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

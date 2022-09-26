import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class ForgotPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string
}
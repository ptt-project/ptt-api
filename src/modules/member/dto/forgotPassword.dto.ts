import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class ForgotPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string
}
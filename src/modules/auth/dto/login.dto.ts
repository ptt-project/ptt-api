import { IsNotEmpty, IsString, IsEmail, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  password: string
}

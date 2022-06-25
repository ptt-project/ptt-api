import { IsNotEmpty, IsString, IsEmail, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsNotEmpty()
  pdpaStatus: boolean

  @IsString()
  @IsNotEmpty()
  otp: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}
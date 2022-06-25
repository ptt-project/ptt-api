import { IsNotEmpty, IsString, IsEmail, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'
import { MemberGenderType } from 'src/db/entities/Member'

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
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string

  @IsString()
  @IsNotEmpty()
  gender: MemberGenderType
}

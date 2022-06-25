import { IsNotEmpty, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class sendOtpRequestDto {
  @IsString()
  @IsNotEmpty()
  mobile: string

  detail: string
}

export class verifyOtpRequestDto {
  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  refCode: string

  @IsString()
  @IsNotEmpty()
  otpCode: string
}

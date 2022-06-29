import { IsNotEmpty, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class sendOtpRequestDto {
  @IsString()
  @IsNotEmpty()
  reference: string

  @IsString()
  @IsNotEmpty()
  type: string
}

export class verifyOtpRequestDto {
  @IsString()
  @IsNotEmpty()
  reference: string

  @IsString()
  @IsNotEmpty()
  refCode: string

  @IsString()
  @IsNotEmpty()
  otpCode: string
}

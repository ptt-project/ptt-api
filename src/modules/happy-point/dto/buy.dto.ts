import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class BuyHappyPointRequestDto {
  @IsNotEmpty()
  amount: number

  @IsNotEmpty()
  point: number

  @IsString()
  @IsNotEmpty()
  refId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mobile: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

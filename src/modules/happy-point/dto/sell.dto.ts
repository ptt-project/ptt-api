import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SellHappyPointRequestDto {
  @IsNotEmpty()
  point: number

  @IsNotEmpty()
  totalAmount: number

  @IsNotEmpty()
  feeAmount: number

  @IsNotEmpty()
  amount: number

  @IsString()
  @IsNotEmpty()
  refId: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

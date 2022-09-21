import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SellHappyPointRequestDto {
  @IsString()
  @IsNotEmpty()
  transactionDate: string

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
  @MaxLength(10)
  mobile: string

  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

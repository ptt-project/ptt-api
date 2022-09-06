import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class TransferHappyPointDto {
  @IsString()
  @IsNotEmpty()
  toMemberUsername: string

  @IsString()
  @IsNotEmpty()
  transactionDate: string

  @IsNotEmpty()
  totalPoint: number

  @IsNotEmpty()
  feePoint: number

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

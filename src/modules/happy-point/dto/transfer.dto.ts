import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class TransferHappyPointDto {
  @IsString()
  @IsNotEmpty()
  toMemberUsername: string

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
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

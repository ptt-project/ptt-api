import { IsIn, IsOptional, IsNotEmpty, IsString } from 'class-validator'

export class getHappyPointTransactionQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @IsIn(['SELL', 'BUY', 'TRANSFER'])
  type?: string
}

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
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

export class RequestSetRedisDto {
  @IsNotEmpty()
  key: string

  @IsNotEmpty()
  value: any
}

export class RequestGetRedisDto {
  @IsNotEmpty()
  key: string
}

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

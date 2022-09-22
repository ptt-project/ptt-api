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

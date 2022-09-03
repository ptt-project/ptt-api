import { Controller } from '@nestjs/common'
import { ExchangeRateService } from './exchange-rate.service'
import { IsNotEmpty, IsString } from 'class-validator'

export class SendEmailExampleDto {
  @IsString()
  @IsNotEmpty()
  email: string
}

@Controller('v1/exchange-rates')
export class ExchangeRateContoller {
  constructor(private readonly exchagneRateService: ExchangeRateService) {}
}

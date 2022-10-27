import { Controller } from '@nestjs/common'
import { MasterConfigService } from './service/master-config.service'
import { IsNotEmpty, IsString } from 'class-validator'

export class SendEmailExampleDto {
  @IsString()
  @IsNotEmpty()
  email: string
}

@Controller('v1/exchange-rates')
export class MasterConfigContoller {
  constructor(private readonly masterConfigService: MasterConfigService) {}
}

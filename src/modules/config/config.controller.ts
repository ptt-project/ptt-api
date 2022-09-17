import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { AppConfigService } from './config.service'
import { getConfigOptionRequestDTO } from './dto/config.dto'

@Controller('v1/configs')
export class AppConfigController {
  constructor(
    private readonly appConfigService: AppConfigService,
  ) {}

  @Get('/options')
  @Transaction()
  async getMasterOptions(
    @Query() query: getConfigOptionRequestDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.appConfigService.GetMasterOptionsHandler(
      this.appConfigService.InquiryBrandOptionsFormDbFunc(etm),
      this.appConfigService.InquiryPlatformCategoryOptionsFormDbFunc(etm),
      this.appConfigService.InquiryBankOptionsFormDbFunc(etm),
      this.appConfigService.InquiryAddressOptionsFormDbFunc(etm),
    )(query)
  }
}

import { Process, Processor } from '@nestjs/bull'
import { Connection, EntityManager, getConnection } from 'typeorm'

import { HappyPointService } from 'src/modules/happy-point/service/happy-point.service'
import { MasterConfigService } from 'src/modules/master-config/service/master-config.service'

@Processor('happyPoint')
export class HappyPointProcessor {
  constructor(
    private readonly happyPointService: HappyPointService,
    private readonly masterConfigService: MasterConfigService,
  ) {}

  @Process('updateLimitTransfer')
  async handleProcess() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    return await this.happyPointService.UpdateResetLimitTransferHandler(
      this.masterConfigService.InquiryMasterConfigFunc(etm),
      this.happyPointService.UpdateResetLimitTransferFunc(etm),
    )()
  }
}

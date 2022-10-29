import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { MasterConfig } from 'src/db/entities/MasterConfig'
import { EntityManager } from 'typeorm'
import { InquiryMasterConfigType } from '../type/master-config.type'

@Injectable()
export class MasterConfigService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(MasterConfigService.name)
  }

  async InquiryMasterConfigFunc(
    etm: EntityManager,
  ): Promise<InquiryMasterConfigType> {
    return async () => {
      let masterConfig: MasterConfig
      try {
        masterConfig = await etm.findOne(MasterConfig)
      } catch (error) {
        return [masterConfig, '']
      }

      if (!masterConfig) {
        return [masterConfig, 'Not found master-config please init app.']
      }

      return [masterConfig, '']
    }
  }
}

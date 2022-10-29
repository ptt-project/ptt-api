import { Module } from '@nestjs/common'
import { MasterConfigContoller } from './master-config.controller'
import { MasterConfigService } from './service/master-config.service'

@Module({
  controllers: [MasterConfigContoller],
  providers: [MasterConfigService],
  exports: [MasterConfigService],
})
export class MasterConfigModule {}

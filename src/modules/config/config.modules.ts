import { Module } from '@nestjs/common'

import { AppConfigController } from './config.controller'
import { AppConfigService } from './service/config.service'

@Module({
  controllers: [AppConfigController],
  providers: [AppConfigService],
  exports: [],
})
export class AppConfigModule {}

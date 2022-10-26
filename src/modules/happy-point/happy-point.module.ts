import { Module } from '@nestjs/common'
import { MasterConfigModule } from '../master-config/master-config.module'
import { MasterConfigService } from '../master-config/service/master-config.service'
import { OtpModule } from '../otp/otp.modules'
import { OtpService } from '../otp/service/otp.service'
import { WalletModule } from '../wallet/wallet.modules'
import { WalletService } from '../wallet/service/wallet.service'
import { HappyPointContoller } from './happy-point.controller'
import { HappyPointService } from './service/happy-point.service'
import { LookupService } from './service/lookup.service'
import { RedisModule } from 'nestjs-redis'

@Module({
  imports: [
    MasterConfigModule,
    OtpModule,
    WalletModule,
    RedisModule.register({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    }),
    // RedisModule.forRootAsync({
    //   useFactory: async (configService: ConfigService) => configService.get('redis'), // or use async method
    //   //useFactory: async (configService: ConfigService) => configService.get('redis'),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [HappyPointContoller],
  providers: [
    MasterConfigService,
    HappyPointService,
    LookupService,
    OtpService,
    WalletService,
  ],
  exports: [HappyPointService],
})
export class HappyPointModule {}

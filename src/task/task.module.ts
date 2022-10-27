import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { TaskController } from './task.controller'
import { BullBoardProvider } from './bull-board.provider'
import { TaskService } from './task.service'
import { HappyPointProcessor } from './happy-point.processor'
import { HappyPointModule } from 'src/modules/happy-point/happy-point.module'
import { MasterConfigModule } from 'src/modules/master-config/master-config.module'

// import { NotifyProcessor } from './notify.processor'
@Module({
  imports: [
    BullModule.registerQueue({ name: 'happyPoint' }),
    HappyPointModule,
    MasterConfigModule,
  ],
  controllers: [TaskController],
  providers: [BullBoardProvider, TaskService, HappyPointProcessor],
})
export class TaskModule {}

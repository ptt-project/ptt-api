import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { JobController } from './job.controller'
import { BullBoardProvider } from './bull-board.provider'

@Module({
  imports: [BullModule.registerQueue()],
  controllers: [JobController],
  providers: [BullBoardProvider],
})
export class JobModule {}

import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { Queue } from 'bull'
import { ExpressAdapter } from '@bull-board/express'
import { createBullBoard } from '@bull-board/api'

export const bullServerAdapter = new ExpressAdapter()
@Injectable()
export class BullBoardProvider {
  constructor(
    @InjectQueue('happyPoint')
    private readonly happyPointQueue: Queue,
  ) {
    createBullBoard({
      queues: [new BullAdapter(happyPointQueue)],
      serverAdapter: bullServerAdapter,
    })
  }
}

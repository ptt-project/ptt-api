import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'

export const bullServerAdapter = new ExpressAdapter()
@Injectable()
export class BullBoardProvider {
  constructor() {
    createBullBoard({
      queues: [],
      serverAdapter: bullServerAdapter,
    })
  }
}

import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Queue } from 'bullmq'

@Injectable()
export class TaskService {
  constructor(
    @InjectQueue('happyPoint') private readonly happyPointQueue: Queue,
  ) {}

  // @Cron(CronExpression.EVERY_6_HOURS)
  // removeUnusedAttachment() {
  //   this.attachmentQueue.add('removeUnusedAttachment', {})
  // }

  // run every midnight ( 00.00 )
  // @Cron('0 0 * * *', { name: 'job_timeline' })
  // // @Cron('*/5 * * * *', { name: 'job_timeline' })
  // cronJobTimeline() {
  //   this.timelineQueue.add('update_timeline', {})
  // }

  // run every 2 sec
  // @Cron('*/2 * * * * *', { name: 'job1' })
  // cronJob() {
  //   this.firstQueue.add('firstProcess', {})
  // }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'jobUpdateLimitTransfer',
    timeZone: 'Asia/Bangkok',
  })
  jobUpdateLimitTransfer() {
    this.happyPointQueue.add('updateLimitTransfer', {})
  }

  // run every 2 sec
  // @Cron('*/2 * * * * *', { name: 'job1' })
  // cronJob() {
  //   this.firstQueue.add('firstProcess', {})
  // }

  // run every 2 sec
  // @Cron('*/2 * * * * *', { name: 'job1' })
  // cronJob() {
  //   this.firstQueue.add('firstProcess', {})
  // }
}

import { Controller } from '@nestjs/common'

@Controller('v1/tasks')
export class TaskController {
  // constructor(@InjectQueue('first') private readonly firstQueue: Queue) {}
  // @Post('first-process')
  // async transcode() {
  //   await this.firstQueue.add('firstProcess', {
  //     file: 'audio.mp3',
  //   })
  //   return { message: 'success' }
  // }
  // @Post('test-dca')
  // async testDca() {
  //   await this.dcaQueue.add('autoBuyDca')
  //   return { message: 'success' }
  // }
  // @Post('resume-dca')
  // async resumeDca() {
  //   return await this.dcaQueue.resume()
  // }
  // @Post('resume-notify')
  // async notify() {
  //   return await this.notifyQueue.resume()
  // }
  // @Post('stop-dca')
  // async stopDca() {
  //   return await this.dcaQueue.pause()
  // }
}

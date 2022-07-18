import { Controller, Get } from '@nestjs/common'

// @Auth()
@Controller('v1/jobs')
export class JobController {
  @Get('')
  async testPaymentDca() {
    console.log('hello wordl jobs!!')
  }
}

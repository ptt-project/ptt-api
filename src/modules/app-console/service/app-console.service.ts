import { Command, Console } from 'nestjs-console'
import { api } from 'src/utils/api'
import { EmailService } from '../../email/service/email.service'

@Console()
export class AppConsoleService {
  constructor(private readonly emailService: EmailService) {}

  @Command({
    command: 'test-console',
    description: 'test for first command',
  })
  helloWorld() {
    console.log('hello world !!')
  }

  @Command({
    command: 'send-email',
    description: 'example and test send email',
  })
  async sendEmail() {
    const toEmail = 'mannakub1@gmail.com'
    await this.emailService.sendEmail({
      to: toEmail,
      subject: 'Example Email',
      templateName: 'example',
      context: { name: 'Mannies123' },
    })
  }

  @Command({
    command: 'request-otp',
    description: 'test send request otp to sms-mkt',
  })
  async sendRequestOtp() {
    const params = {
      projectKey: process.env.SMS_MKT_API_PROJECT_KEY,
      phone: '0860278298',
      refCode: '560446',
    }
    const result = await api.smsMkt.post('otp-send', params)
    console.log('result', result.data)
  }

  @Command({
    command: 'validate-otp',
    description: 'test send request otp to sms-mkt',
  })
  async validateRequestOtp() {
    const params = {
      token: '29e833f2-0e2e-411c-aa1e-ff0adcf4c03d',
      otpCode: '546072',
      refCode: '514522',
    }
    const result = await api.smsMkt.post('otp-validate', params)
    console.log('result', result.data)
    // result.data.code == 500 => token is expire
  }
}

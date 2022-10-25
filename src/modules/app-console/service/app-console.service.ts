import { Command, Console } from 'nestjs-console'
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
}

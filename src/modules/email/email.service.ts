import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { MailerService } from '@nestjs-modules/mailer'

export type SendEmailType = {
  to: string
  subject: string
  templateName: string
  context: Record<string, any>
}

@Injectable()
export class EmailService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly mailerService: MailerService,
  ) {
    this.logger.setContext(EmailService.name)
  }

  sendEmail(params: SendEmailType) {
    const { to, subject, templateName, context } = params
    this.mailerService
      .sendMail({
        to,
        subject,
        context,
        from: process.env.SMTP_FROM_EMAIL,
        template: '/app/src/modules/email/template/' + templateName,
      })
      .then(() => {
        console.log('send mail success')
      })
      .catch(err => {
        console.log('err', err)
        console.log('error mail success')
      })
  }
}

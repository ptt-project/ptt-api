import { Controller, Post, Body } from '@nestjs/common'
import { EmailService } from './email.service'
import { IsNotEmpty, IsString } from 'class-validator'

export class SendEmailExampleDto {
  @IsString()
  @IsNotEmpty()
  email: string
}

@Controller('v1/emails')
export class EmailContoller {
  constructor(private readonly emailService: EmailService) {}

  @Post('')
  async sendEmail(@Body() body: SendEmailExampleDto) {
    return await this.emailService.sendEmail({
      to: body.email,
      subject: 'Example Send Email',
      templateName: 'example',
      context: { name: 'HappyShopping' },
    })
  }
}

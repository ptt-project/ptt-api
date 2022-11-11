import { Command, Console } from 'nestjs-console'
import { OrderService } from 'src/modules/order/service/order.service'
import { AddressToShippop } from 'src/modules/order/type/order.type'
import { api } from 'src/utils/api'
import { ContentType, createFormData } from 'src/utils/api/tools'
import { EmailService } from '../../email/service/email.service'

@Console()
export class AppConsoleService {
  constructor(
    private readonly emailService: EmailService,
    private readonly orderService: OrderService,
  ) {}

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

  @Command({
    command: 'get-price',
    description: 'test get price from shippop',
  })
  async getPriceFromShippop() {
    const params = {
      api_key: process.env.SHIPPOP_API_KEY,
      data: [
        {
          from: {
            name: 'ชื่อผู้ส่ง อยู่ตรงนี้จ้ายาวๆไป',
            address: '123/456 Testor Tower',
            district: 'บางรัก',
            state: 'บางรัก',
            province: 'กรุงเทพมหานคร',
            postcode: '10200',
            tel: '0800000000',
          },
          to: {
            name: 'ชื่อผู้ส่ง อยู่ตรงนี้จ้ายาวๆไป',
            address: '456/789 Testor Tower',
            district: 'บางรัก',
            state: 'บางรัก',
            province: 'กรุงเทพมหานคร',
            postcode: '10600',
            tel: '0800000000',
          },
          parcel: {
            name: 'size A',
            weight: '1001',
            width: '15',
            length: '15',
            height: '15',
          },
        },
      ],
    }

    const formDataParams = createFormData(params)
    const { data } = await api.shippop.post<any>('pricelist/', formDataParams, {
      contentType: ContentType.FORMDATA,
    })
    console.log('result', data.data[0].tP2)
    console.log('result', data.data[0].eMST)
    console.log('result', data.data[0].kRYP)
  }

  @Command({
    command: 'get-price-from-func',
    description: 'test get price from shippop',
  })
  async getPriceFromShippopInFunc() {
    const from: AddressToShippop = {
      name: 'ชื่อผู้ส่ง อยู่ตรงนี้จ้ายาวๆไป',
      address: '123/456 Testor Tower',
      district: 'บางรัก',
      tambon: 'บางรัก',
      province: 'กรุงเทพมหานคร',
      postcode: '10200',
      mobile: '0800000000',
    }
    const to: AddressToShippop = {
      name: 'ชื่อผู้ส่ง อยู่ตรงนี้จ้ายาวๆไป',
      address: '456/789 Testor Tower',
      district: 'บางรัก',
      tambon: 'บางรัก',
      province: 'กรุงเทพมหานคร',
      postcode: '10600',
      mobile: '0800000000',
    }

    const products = [
      {
        name: 'size A',
        weight: 1001,
        width: 15,
        length: 15,
        height: 15,
      },
      {
        name: 'size A',
        weight: 1001,
        width: 15,
        length: 15,
        height: 15,
      },
    ]

    const resp = await this.orderService.InquiryPriceFromShippopFunc()(
      from,
      to,
      products,
    )
    console.log('get price', resp)
  }
}

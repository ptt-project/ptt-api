import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { randomStr, randomNum } from 'src/utils/helpers'

@Injectable()
export class OtpService {
  async requestOtp(body) {
    return await this.processRequestOtp(this.sendOtp(), this.saveOtp())(body)
  }

  async verifyOtp(body) {
    return await this.processVerifyOtp(this.verify())(body)
  }

  processRequestOtp(sendOtp, saveOtp) {
    return async ({ mobile }) => {
      const [otpData, sendOtpError] = await sendOtp(mobile)

      if (sendOtpError) {
        return response(undefined, '400', 'Fail to Send Otp')
      }

      const [_, saveOtpError] = await saveOtp(otpData)

      if (saveOtpError) {
        return response(undefined, '400', 'Fail to Save Otp')
      }

      return response(
        { refCode: otpData.refCode, mobile },
        '200',
        'Send Otp Successfully',
      )
    }
  }

  sendOtp() {
    return async (mobile: string) => {
      const refCode = randomStr(4)
      const otpCode = randomNum(6)
      // sand otp

      console.log(refCode, otpCode)

      return [
        {
          mobile,
          refCode,
          otpCode,
        },
        null,
      ]
    }
  }

  saveOtp() {
    return async (otpData: {
      refCode: string
      otpCode: string
      mobile: string
    }) => {
      // save otpData

      return ['saved otp', null]
    }
  }

  processVerifyOtp(verifyOtp) {
    return async ({ refCode, otpCode, mobile }) => {
      const [_, verifyOtpError] = await verifyOtp(refCode, otpCode, mobile)

      if (verifyOtpError) {
        return response(undefined, '400', 'Fail to Verify Otp')
      }

      return true
    }
  }

  verify() {
    return async (refCode: string, otpCode: string, mobile: string) => {
      // verify otp

      return ['Otp is valid', null]
    }
  }
}

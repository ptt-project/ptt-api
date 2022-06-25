import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { randomStr, randomNum } from 'src/utils/helpers'
import { Otp } from 'src/db/entities/Otp'
import { sendOtpRequestDto, verifyOtpRequestDto } from './dto/otp.dto'
import {
  InternalSeverError,
  UnableVerifyOtpIncorrect,
  UnableVerifyOtpDataNotfound,
  UnableVerifyOtpLimitExceeded,
  UnableVerifyOtpIsAreadyVerified,
} from 'src/utils/response-code'
import { validateBadRequest } from 'src/utils/response-error'

export type SendOtpType = {
  refCode: string
  otpCode: string
  mobile: string
  detail: string
}

export type InquirySendOtpType = (
  params: sendOtpRequestDto,
) => Promise<[SendOtpType, number]>

export type InquiryVerifyOtpType = (
  params: verifyOtpRequestDto,
) => Promise<[number, string]>

@Injectable()
export class OtpService {
  async requestOtp(body) {
    return await this.requestOtpHandler(this.sendOtp(), this.saveOtpToDb())(body)
  }

  async verifyOtp(body) {
    return await this.verifyOtpHandler(this.verifyOtpByDb())(body)
  }

  async testVerifyOtp(body) {
    const result = await this.verifyOtpHandler(this.verifyOtpByDb())(body)
    if(result === true) return response(undefined)
    return result
  }

  requestOtpHandler(sendOtp: Promise<InquirySendOtpType>, saveOtp) {
    return async ({ mobile, detail }) => {
      const [otpData, sendOtpError] = await (await sendOtp)({mobile, detail})

      if (sendOtpError != 0) {
        return validateBadRequest(sendOtpError, 'Fail to Send Otp')
      }

      const [_, saveOtpError] = await saveOtp(otpData)

      if (saveOtpError) {
        return validateBadRequest(saveOtpError, 'Fail to Save Otp')
      }

      return response(
        { refCode: otpData.refCode, mobile },
        '200',
        'Send Otp Successfully',
      )
    }
  }

  async sendOtp(): Promise<InquirySendOtpType> {
    return async (params : sendOtpRequestDto) => {
      const refCode:string = randomStr(4)
      const otpCode:string = randomNum(6)
      // Todo: sand otp

      console.log(refCode, otpCode)

      const result:SendOtpType = {
        ...params,
        refCode,
        otpCode,
      }

      return [
        result,
        0,
      ]
    }
  }

  saveOtpToDb() {
    return async (otpData: SendOtpType) => {
      // save otpData
      let otp: Otp
      try {
        otp = Otp.create({
          ...otpData,
        })

        await otp.save()
      } catch (error) {
        return [otp, error]
      }

      return [otp, 0]
    }
  }

  verifyOtpHandler(verifyOtp: Promise<InquiryVerifyOtpType>)  {
    return async ({ refCode, otpCode, mobile }) => {
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (await verifyOtp)({refCode, otpCode, mobile})

      if (verifyOtpErrorCode != 0) {
        return validateBadRequest(verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      return true
    }
  }

  async verifyOtpByDb(): Promise<InquiryVerifyOtpType> {
    return async (otpData : verifyOtpRequestDto) => {

      return [0, null]
      // verify otp
      const { mobile, otpCode, refCode } = otpData
      try {
        const otp = await Otp.findOne({
          where: {
            mobile,
            refCode
          }
        })
        if (!otp) {
          return [UnableVerifyOtpDataNotfound, 'Otp request is invalid']
        }
        if (otp.status === 'verified') {
          return [
            UnableVerifyOtpIsAreadyVerified,
            'Otp code is already verify',
          ]
        }
        otp.verifyCount += 1
        if (otp.otpCode !== otpCode) {
          return [
            UnableVerifyOtpIncorrect,
            'Otp code is incorrect',
          ]
        }
        if (otp.verifyCount > 3) {
          return [
            UnableVerifyOtpLimitExceeded,
            'Otp verification has exceeded the limit',
          ]
        }
        otp.status = 'verified'
        await otp.save()
      } catch (error) {
        return [InternalSeverError, error]
      }

      return [0, null]
    }
  }
}

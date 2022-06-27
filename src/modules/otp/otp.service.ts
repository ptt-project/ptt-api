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
  UnableToSendOtpInTimeLimit,
} from 'src/utils/response-code'

import { validateBadRequest } from 'src/utils/response-error'

export type SendOtpType = {
  refCode: string
  otpCode: string
  reference: string
  type: string
}

export type InquirySendOtpType = (
  params: sendOtpRequestDto,
) => Promise<[SendOtpType, number]>

export type InquiryValidateSendOtpType = (
  params: sendOtpRequestDto,
) => Promise<[Otp, number]>

export type InquiryVerifyOtpType = (
  params: verifyOtpRequestDto,
) => Promise<[number, string]>

@Injectable()
export class OtpService {
  async requestOtp(body) {
    return await this.requestOtpHandler(this.verifyForSendOtp(), this.sendOtp(), this.saveOtpToDb())(body)
  }

  async verifyOtp(body) {
    return await this.verifyOtpHandler(this.verifyOtpByDb())(body)
  }

  async testVerifyOtp(body) {
    const result = await this.verifyOtpHandler(this.verifyOtpByDb())(body)
    if(result === true) return response(undefined)
    return result
  }

  requestOtpHandler(verifyForSend: Promise<InquirySendOtpType>, sendOtp: Promise<InquirySendOtpType>, saveOtp) {
    return async ({ reference, type }) => {
      const [otp, verSendOtpError] = await (await verifyForSend)({reference, type})

      if (verSendOtpError != 0) {
        return validateBadRequest(UnableToSendOtpInTimeLimit, 'Unable to send Otp with in 90 sec')
      }

      const [otpData, sendOtpError] = await (await sendOtp)({reference, type})

      if (sendOtpError != 0) {
        return validateBadRequest(sendOtpError, 'Fail to Send Otp')
      }

      const [_, saveOtpError] = await saveOtp(otp, otpData)

      if (saveOtpError) {
        return validateBadRequest(saveOtpError, 'Fail to Save Otp')
      }

      return response(
        { refCode: otpData.refCode, reference },
        '200',
        'Send Otp Successfully',
      )
    }
  }

  async verifyForSendOtp(): Promise<InquiryValidateSendOtpType> {
    return async (params : sendOtpRequestDto) => {
      let otp: Otp
      try {
        otp = await Otp.findOne({
          where: {
            reference: params.reference,
          }
        })

        if (otp && new Date().getTime() - new Date(otp.createdAt).getTime() < 90000) {
          return [otp, UnableToSendOtpInTimeLimit]
        }

      } catch (error) {
        return [otp, error]
      }

      return [
        otp,
        0,
      ]
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
    return async (otp: Otp, otpData: SendOtpType) => {
      // save otpData
      if (otp) {
        try {
        otp.refCode = otpData.refCode
        otp.otpCode = otpData.otpCode
        otp.type = otpData.type
        otp.verifyCount = 0
        otp.createdAt = new Date()

        await otp.save()
        } catch (error) {
          return [otp, error]
        }

        return [otp, 0]
      } else {
        let newOtp: Otp;
        try {
          newOtp = Otp.create({
            ...otpData,
          })

          await newOtp.save()
        } catch (error) {
          return [newOtp, error]
        }

        return [newOtp, 0]
      }
    }
  }

  verifyOtpHandler(verifyOtp: Promise<InquiryVerifyOtpType>)  {
    return async ({ refCode, otpCode, reference }) => {
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (await verifyOtp)({refCode, otpCode, reference})

      if (verifyOtpErrorCode != 0) {
        return validateBadRequest(verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      return true
    }
  }

  async verifyOtpByDb(): Promise<InquiryVerifyOtpType> {
    return async (otpData : verifyOtpRequestDto) => {

      // return [0, null]
      // verify otp
      const { reference, otpCode, refCode } = otpData
      try {
        const otp = await Otp.findOne({
          where: {
            reference,
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
        await otp.save()
        if (otp.verifyCount > 3) {
          return [
            UnableVerifyOtpLimitExceeded,
            'Otp verification has exceeded the limit',
          ]
        }
        if (otp.otpCode !== otpCode) {
          return [
            UnableVerifyOtpIncorrect,
            'Otp code is incorrect',
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

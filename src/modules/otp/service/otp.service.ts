import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { randomStr, randomNum } from 'src/utils/helpers'
import { Otp } from 'src/db/entities/Otp'
import { sendOtpRequestDto, verifyOtpRequestDto } from '../dto/otp.dto'
import {
  InternalSeverError,
  UnableVerifyOtpIncorrect,
  UnableVerifyOtpDataNotfound,
  UnableVerifyOtpLimitExceeded,
  UnableVerifyOtpIsAreadyVerified,
  UnableToSendOtp,
} from 'src/utils/response-code'

import { validateBadRequest } from 'src/utils/response-error'
import { EntityManager } from 'typeorm'

import {
  SendOtpType,
  InquirySendOtpType,
  InquirySaveOtpType,
  InquiryValidateSendOtpType,
  InquiryVerifyOtpType,
} from '../type/otp.type'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'

@Injectable()
export class OtpService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(OtpService.name)
  }

  requestOtpHandler(
    verifyForSend: Promise<InquiryValidateSendOtpType>,
    sendOtp: Promise<InquirySendOtpType>,
    saveOtp: InquirySaveOtpType,
  ) {
    return async ({ reference, type }) => {
      const start = dayjs()
      const [otp, verSendOtpError] = await (await verifyForSend)({
        reference,
        type,
      })

      if (verSendOtpError != 0) {
        if (verSendOtpError == UnableToSendOtp)
          return validateBadRequest(
            UnableToSendOtp,
            'Unable to send Otp with in 90 sec',
          )
        else {
          return validateBadRequest(UnableToSendOtp, 'Unable to send Otp')
        }
      }

      const [otpData, sendOtpError] = await (await sendOtp)({ reference, type })

      if (sendOtpError != 0) {
        return validateBadRequest(sendOtpError, 'Fail to Send Otp')
      }

      const [_, saveOtpError] = await saveOtp(otp, otpData)

      if (saveOtpError != 0) {
        return validateBadRequest(saveOtpError, 'Fail to Save Otp')
      }

      const responseObj: any = { refCode: otpData.refCode, reference }

      if (process.env.NODE_ENV !== 'PROD' && process.env.NODE_ENV !== 'UAT') {
        responseObj.otpCode = otpData.otpCode
      }
      this.logger.info(`Done RequestOtpHandler ${dayjs().diff(start)} ms`)
      return response(responseObj)
    }
  }

  async verifyForSendOtp(
    etm: EntityManager,
  ): Promise<InquiryValidateSendOtpType> {
    return async (params: sendOtpRequestDto) => {
      const start = dayjs()
      let otp: Otp
      try {
        otp = await etm.findOne(Otp, {
          where: {
            reference: params.reference,
          },
        })

        if (
          otp &&
          new Date().getTime() - new Date(otp.createdAt).getTime() < 90000
        ) {
          return [otp, UnableToSendOtp]
        }
      } catch (error) {
        return [otp, error.message]
      }

      this.logger.info(`Done VerifyForSendOtp ${dayjs().diff(start)} ms`)
      return [otp, 0]
    }
  }

  async sendOtp(): Promise<InquirySendOtpType> {
    return async (params: sendOtpRequestDto) => {
      const start = dayjs()
      const refCode: string = randomStr(4)
      const otpCode: string = randomNum(6)
      // Todo: sand otp

      console.log(refCode, otpCode)

      const result: SendOtpType = {
        ...params,
        refCode,
        otpCode,
      }

      this.logger.info(`Done SendOtp ${dayjs().diff(start)} ms`)
      return [result, 0]
    }
  }

  saveOtpToDb(etm: EntityManager): InquirySaveOtpType {
    return async (otp: Otp, otpData: SendOtpType) => {
      const start = dayjs()
      // save otpData
      if (otp) {
        try {
          otp.refCode = otpData.refCode
          otp.otpCode = otpData.otpCode
          otp.type = otpData.type
          otp.verifyCount = 0
          otp.status = 'send'
          otp.createdAt = new Date()

          await etm.save(otp)
        } catch (error) {
          return [otp, UnableToSendOtp]
        }

        return [otp, 0]
      } else {
        let newOtp: Otp
        try {
          newOtp = etm.create(Otp, {
            ...otpData,
          })

          await newOtp.save()
        } catch (error) {
          return [newOtp, UnableToSendOtp]
        }

        this.logger.info(`Done SaveOtpToDb ${dayjs().diff(start)} ms`)
        return [newOtp, 0]
      }
    }
  }

  verifyOtpHandler(inquiryVerifyOtp: Promise<InquiryVerifyOtpType>) {
    return async (otpData: verifyOtpRequestDto) => {
      const start = dayjs()
      const { reference, otpCode, refCode } = otpData
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )({ refCode, otpCode, reference })

      if (verifyOtpErrorCode != 0) {
        return validateBadRequest(verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      this.logger.info(`Done VerifyOtpHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InquiryVerifyOtpFunc(
    etm: EntityManager,
  ): Promise<InquiryVerifyOtpType> {
    return async (otpData: verifyOtpRequestDto) => {
      const start = dayjs()
      if (process.env.SKIP_VERIFY_OTP) {
        return [0, null]
      }
      const { reference, otpCode, refCode } = otpData
      try {
        const otp = await Otp.findOne({
          where: {
            reference,
            refCode,
          },
        })
        if (!otp) {
          return [UnableVerifyOtpDataNotfound, 'Otp request is invalid']
        }
        if (otp.status === 'verified') {
          return [UnableVerifyOtpIsAreadyVerified, 'Otp code is already verify']
        }
        otp.verifyCount += 1
        await etm.save(otp)
        if (otp.verifyCount > 3) {
          return [
            UnableVerifyOtpLimitExceeded,
            'Otp verification has exceeded the limit',
          ]
        }
        if (otp.otpCode !== otpCode) {
          return [UnableVerifyOtpIncorrect, 'Otp code is incorrect']
        }
        otp.status = 'verified'
        await etm.save(otp)
      } catch (error) {
        return [InternalSeverError, error.message]
      }

      this.logger.info(`Done InquiryVerifyOtpFunc ${dayjs().diff(start)} ms`)
      return [0, null]
    }
  }
}

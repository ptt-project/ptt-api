import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { genUuid, randomNum } from 'src/utils/helpers'
import { Otp } from 'src/db/entities/Otp'
import { sendOtpRequestDto, verifyOtpRequestDto } from '../dto/otp.dto'
import {
  InternalSeverError,
  UnableVerifyOtpDataNotfound,
  UnableVerifyOtpLimitExceeded,
  UnableVerifyOtpIsAreadyVerified,
  UnableToSendOtp,
  UnableInquiryValidateSendOtpType,
  UnableRequestValidateOtpToSmsMkt,
  OtpTokenExpiredInSmsMkt,
  UnableVerifyOtpIncorrect,
} from 'src/utils/response-code'

import { validateBadRequest } from 'src/utils/response-error'
import { EntityManager } from 'typeorm'

import {
  SendOtpType,
  CreateOrUpdateOtpToDbType,
  InquiryValidateSendOtpType,
  InquiryVerifyOtpType,
  RequestSendOtpToSmsMkt,
  ResponseSendOtpToSmsKmt,
  ParamsSendOtp,
  RequestValidateOtp,
  ResponseValidateOtp,
} from '../type/otp.type'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { api } from 'src/utils/api'

@Injectable()
export class OtpService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(OtpService.name)
  }

  RequestOtpHandler(
    verifyForSend: Promise<InquiryValidateSendOtpType>,
    sendOtp: Promise<SendOtpType>,
    saveOtp: CreateOrUpdateOtpToDbType,
  ) {
    return async ({ reference, type }) => {
      const start = dayjs()
      const [otp, verSendOtpError] = await (await verifyForSend)({
        reference,
        type,
      })

      if (verSendOtpError != 0) {
        if (verSendOtpError == UnableToSendOtp)
          return response(
            undefined,
            UnableToSendOtp,
            'Unable to send Otp with in 90 sec',
          )
        else {
          return response(undefined, UnableToSendOtp, 'Unable to send Otp')
        }
      }

      const [otpData, sendOtpError] = await (await sendOtp)({ reference, type })

      if (sendOtpError != '') {
        return response(
          undefined,
          UnableInquiryValidateSendOtpType,
          sendOtpError,
        )
      }

      const [, saveOtpError] = await saveOtp(otp, otpData)

      if (saveOtpError != 0) {
        return response(undefined, saveOtpError, 'Fail to Save Otp')
      }

      this.logger.info(`Done RequestOtpHandler ${dayjs().diff(start)} ms`)
      return response(otpData)
    }
  }

  async VerifyForSendOtp(
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

  async SendOtpFunc(): Promise<SendOtpType> {
    return async (params: sendOtpRequestDto) => {
      const start = dayjs()
      let result: ParamsSendOtp

      if (process.env.SKIP_REQUEST_TO_SMS_MKT == 'true') {
        console.log('=== SKIP_REQUEST_TO_SMS_MKT ===')
        const refCode: string = randomNum(6)
        const token: string = genUuid()

        console.log(refCode, token)

        result = {
          ...params,
          refCode,
          token,
        }
      } else {
        let response: ResponseSendOtpToSmsKmt
        const paramsRequestOtp: RequestSendOtpToSmsMkt = {
          projectKey: process.env.SMS_MKT_API_PROJECT_KEY,
          phone: params.reference,
          refCode: '',
        }

        try {
          const { data } = await api.smsMkt.post<ResponseSendOtpToSmsKmt>(
            'otp-send',
            paramsRequestOtp,
          )
          response = data
        } catch (error) {
          return [null, error.message]
        }

        if (response.code != '000') {
          return [null, `Error from API sms-kmt becase ${response.detail}`]
        }

        result = {
          ...params,
          refCode: response.result.refCode,
          token: response.result.token,
        }
      }
      this.logger.info(`Done SendOtp ${dayjs().diff(start)} ms`)
      return [result, '']
    }
  }

  CreateOrUpdateOtpToDbFunc(etm: EntityManager): CreateOrUpdateOtpToDbType {
    return async (otp: Otp, otpData: ParamsSendOtp) => {
      const start = dayjs()
      try {
        if (!otp) {
          otp = etm.create(Otp, {
            reference: otpData.reference,
          })
        }
        otp.type = otpData.type
        otp.token = otpData.token
        otp.refCode = otpData.refCode
        otp.verifyCount = 0
        otp.status = 'send'
        otp.createdAt = new Date()

        await etm.save(otp)
      } catch (error) {
        return [otp, UnableToSendOtp]
      }

      this.logger.info(
        `Done CreateOrUpdateOtpToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [otp, 0]
    }
  }

  VerifyOtpHandler(inquiryVerifyOtp: Promise<InquiryVerifyOtpType>) {
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
    return async (params: verifyOtpRequestDto) => {
      const start = dayjs()
      if (process.env.SKIP_VERIFY_OTP == 'true') {
        console.log('==== SKIP_VERIFY_OTP ====')
        return [0, null]
      }
      const { reference, refCode, otpCode } = params
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

        const RequestValidateOtp: RequestValidateOtp = {
          token: otp.token,
          otpCode,
          refCode,
        }

        let response: ResponseValidateOtp
        try {
          const { data } = await api.smsMkt.post<ResponseValidateOtp>(
            'otp-validate',
            RequestValidateOtp,
          )
          response = data
        } catch (error) {
          return [UnableRequestValidateOtpToSmsMkt, error.message]
        }

        if (response.code == '5000') {
          return [OtpTokenExpiredInSmsMkt, 'refCode expire']
        } else if (response.code == '000' && !response.result.status) {
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

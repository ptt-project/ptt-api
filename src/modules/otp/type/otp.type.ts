import { Otp } from 'src/db/entities/Otp'
import { sendOtpRequestDto, verifyOtpRequestDto } from '../dto/otp.dto'
import { RegisterRequestDto } from '../../auth/dto/register.dto'

export type ParamsSendOtp = {
  reference: string
  type: string
  refCode: string
  token: string
  otpCode?: string
}

export type SendOtpType = (
  params: sendOtpRequestDto,
) => Promise<[ParamsSendOtp, string]>

export type CreateOrUpdateOtpToDbType = (
  otp: Otp,
  otpData: ParamsSendOtp,
) => Promise<[Otp, number]>

export type InquiryValidateSendOtpType = (
  params: sendOtpRequestDto,
) => Promise<[Otp, number]>

export type InquiryVerifyOtpType = (
  params: verifyOtpRequestDto | RegisterRequestDto,
) => Promise<[number, string]>

export type VerifyOtpHandler = (
  body: verifyOtpRequestDto,
) => Promise<boolean | void>

export type RequestSendOtpToSmsMkt = {
  projectKey: string
  phone: string
  refCode: string
}

export type ResponseSendOtpToSmsKmt = {
  code: string
  detail: string
  result: { token: string; refCode: string }
}

export type RequestValidateOtp = {
  token: string
  otpCode: string
  refCode: string
}

export type ResponseValidateOtp = {
  code: string
  detail: string
  result?: { status: boolean }
}

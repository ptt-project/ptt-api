import { Otp } from 'src/db/entities/Otp'
import { sendOtpRequestDto, verifyOtpRequestDto } from '../dto/otp.dto'

import { RegisterRequestDto } from '../../auth/dto/register.dto'
import { EntityManager } from 'typeorm'

export type SendOtpType = {
  refCode: string
  otpCode: string
  reference: string
  type: string
}

export type InquirySendOtpType = (
  params: sendOtpRequestDto,
) => Promise<[SendOtpType, number]>

export type InquirySaveOtpType = (
  otp: Otp,
  otpData: SendOtpType,
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

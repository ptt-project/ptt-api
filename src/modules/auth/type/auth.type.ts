import { Dayjs } from 'dayjs'

import { Member } from '../../../db/entities/Member'

import {
  RegisterRequestDto,
  ValidateRegisterRequestDto,
} from '../dto/register.dto'

export type InquiryMemberExistType = (
  params: RegisterRequestDto | ValidateRegisterRequestDto,
) => Promise<[number, string]>

export type ValidateMobileUsedFuncType = (
  mobilePhone: string,
) => Promise<[number, string]>

export type ValidateInviteTokenFuncType = (
  inviteToken: string,
) => Promise<[Member, number, string]>

export type InsertMemberToDbTye = (
  params: RegisterRequestDto,
  inviter?: Member,
) => Promise<[Member, string]>

export type GenAccessTokenType = (member: Member) => Promise<string>

export type GenRefreshTokenType = (member: Member) => Promise<string>

export type InquiryUserExistByIdType = (id: string) => Promise<[Member, string]>

export type ValidateTokenType = (
  accessToken: string,
  refreshToken: string,
  id: string,
) => Promise<[ValidateTokenResponse, boolean]>

export type ExiredTokenType = (token: string) => Promise<boolean>

export type TokenType = {
  id: string
  expiredAt: Dayjs
}

export type ValidateTokenResponse = {
  accessToken: string
  refreshToken: string
  member: Member
}

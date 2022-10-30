import { Member } from 'src/db/entities/Member'

export type InquiryMemberByIdType = (
  memberId: string,
) => Promise<[Member, string]>

export type UpdatePasswordToMemberType = (
  member: Member,
  newPassword: string,
) => Promise<string>

export type VadlidateOldPasswordType = (
  oldPassword: string,
  oldPasswordParams: string,
) => Promise<string>

export type InquiryEmailExistByEmailType = (
  email: string
) => Promise<[Member, string]>

export type InquiryMemberExistByMobileType = (
  mobile: string
) => Promise<[Member, string]>

export type InquiryMemberExistByLoginTokenAndEmailType = (
  loginToken: string,
  email: string,
) => Promise<[Member, string]>

export type UpdateLoginTokenToMemberType = (
  member: Member,
  loginToken: string,
) => Promise<string>

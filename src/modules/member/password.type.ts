import { Member } from 'src/db/entities/Member'

export type InquiryMemberByIdType = (
  memberId: number,
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

export type InquiryEmailExistByMobileType = (
  mobile: string
) => Promise<[Member, string]>
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

import { Member } from '../../db/entities/Member'

export type InquiryUserExistByUsernameType = (
  username: string,
) => Promise<[Member, string]>

export type ValidatePasswordType = (
  password: string,
  passwordMember: string,
) => Promise<string>

import { Member, MemberGenderType } from 'src/db/entities/Member'
import { SelectQueryBuilder } from 'typeorm'

export type getProfileType = (member: Member) => Promise<any>

export type UpdateProfileToDbParams = {
  firstName: string
  lastName: string
  birthday?: Date
  gender?: MemberGenderType
}

export type UpdateProfileToMemberType = (
  memberId: number,
  params: UpdateProfileToDbParams,
) => Promise<string>

export type InquiryUserExistByMemberIdType = (
  id: number,
) => Promise<[Member, string]>

export type InquiryMemberByUsernameType = (
  q: string,
) => [SelectQueryBuilder<Member>, string]

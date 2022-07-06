import { Member, MemberGenderType } from "src/db/entities/Member"

export type getProfileType = (
    member: Member,
  ) => Promise<any>
  
export type UpdateProfileToDbParams = {
  firstname: string
  lastname: string
  birthday?: Date
  gender?: MemberGenderType
}

export type UpdateProfileToMemberType = (
  memberId: number,
  params: UpdateProfileToDbParams,
) => Promise<string>
import { Member } from "src/db/entities/Member"
import { UpdateProfiledRequestDto } from "../dto/updateProfile.dto"

export type getProfileType = (
    member: Member,
  ) => Promise<any>
  
  export type UpdateProfileToMemberType = (
    member: Member,
    body: UpdateProfiledRequestDto
  ) => Promise<any>
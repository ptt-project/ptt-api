import { IsIn, IsNotEmpty, IsString } from 'class-validator'

export type MemberGenderType = "F" | "M" | "O"
export class UpdateProfiledRequestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsString()
  @IsNotEmpty()
  birthday: Date

  @IsString()
  @IsNotEmpty()
  @IsIn(["M","F","O"])
  gender: MemberGenderType
}

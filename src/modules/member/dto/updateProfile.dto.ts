import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export type MemberGenderType = 'F' | 'M' | 'O'
export class UpdateProfiledRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string

  @IsOptional()
  @IsISO8601()
  birthday?: Date

  @IsOptional()
  @IsIn(['M', 'F', 'O'])
  gender?: MemberGenderType
}

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
  firstname: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastname: string

  @IsOptional()
  @IsISO8601()
  birthday?: Date

  @IsOptional()
  @IsIn(['M', 'F', 'O'])
  gender?: MemberGenderType
}

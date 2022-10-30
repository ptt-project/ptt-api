import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator'

export class SearchMemberByUsernameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  q: string

  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number
}

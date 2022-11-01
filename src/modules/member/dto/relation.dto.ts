import {
  IsNumberString,
  IsOptional,
} from 'class-validator'

export class GetRelationRequestDto {
  @IsNumberString()
  @IsOptional()
  level?: number
}

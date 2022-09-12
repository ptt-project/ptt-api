import {
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class replyCommentRequestDto {
  @IsString()
  @IsNotEmpty()
  reply: string
}
export class getReviewQueryDTO {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @IsBooleanString()
  isReply?: string

  @IsOptional()
  @IsIn(['0', '1', '2', '3', '4', '5'])
  star?: string

  @IsOptional()
  productName?: string

  @IsOptional()
  startDate?: string
  
  @IsOptional()
  endDate?: string
}


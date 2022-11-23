import {
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class ReplyCommentRequestDto {
  @IsString()
  @IsNotEmpty()
  reply: string
}
export class GetReviewOfSellerQueryDto {
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
  startDate?: Date

  @IsOptional()
  endDate?: Date
}

export class GetReviewQueryDto {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  @IsIn(['0', '1', '2', '3', '4', '5'])
  star?: string
}

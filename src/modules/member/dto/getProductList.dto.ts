import { IsOptional } from "class-validator"

export class GetProductListMemberDto {
  @IsOptional()
  limit?: number

  @IsOptional()
  page?: number

  @IsOptional()
  categoryId?: number

  @IsOptional() 
  keyword: string
}
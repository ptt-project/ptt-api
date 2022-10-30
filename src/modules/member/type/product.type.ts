import { ProductProfile } from 'src/db/entities/ProductProfile'
import { SelectQueryBuilder } from 'typeorm'
import { GetProductListMemberDto } from '../dto/getProductList.dto'

export type InquiryProductListByShopIdType = (
  shopId: string,
  query: GetProductListMemberDto,
) => Promise<[SelectQueryBuilder<ProductProfile>, string]>

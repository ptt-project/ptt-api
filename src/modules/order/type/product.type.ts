import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'

export type InquiryProductByIdParams = {
  productId: string
  productOptions1?: string
  productOptions2?: string
}

export type InquiryProductByIdType = (
  params: InquiryProductByIdParams,
) => Promise<[Product, string]>

export type InquiryProducProfiletByIdType = (
  productProfileId: string,
) => Promise<[ProductProfile, string]>

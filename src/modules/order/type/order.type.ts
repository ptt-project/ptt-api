export type ShippopGetPriceDetail = {
  courierCode: string
  price: string
  estimateTime: string
  available: boolean
  remark: string
  errCode: string
  courierName: string
  priceFuelSurcharge?: number
}

export type ShippopGetPriceResponse = {
  status: boolean
  data: ShippopGetPriceDetail
}

export type AddressToShippop = {
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address: string
  lat?: number
  lng?: number
}

export type ProductForShippopGetPrice = {
  name: string
  weight: number
  width: number
  length: number
  height: number
}

export type InquiryPriceFromShippopType = (
  fromAddress: AddressToShippop,
  toAddress: AddressToShippop,
  products: ProductForShippopGetPrice[],
) => Promise<ShippopGetPriceDetail[]>

import { Injectable } from '@nestjs/common'

import { PinoLogger } from 'nestjs-pino'

import {
  AddressToShippop,
  InquiryPriceFromShippopType,
  ProductForShippopGetPrice,
  ShippopGetPriceDetail,
  ShippopGetPriceResponse,
} from '../type/order.type'

import { ContentType, createFormData } from 'src/utils/api/tools'
import { api } from 'src/utils/api'
import dayjs from 'dayjs'

@Injectable()
export class OrderService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(OrderService.name)
  }

  InquiryPriceFromShippopFunc(): InquiryPriceFromShippopType {
    return async (
      fromAddress: AddressToShippop,
      toAddress: AddressToShippop,
      products: ProductForShippopGetPrice[],
    ): Promise<ShippopGetPriceDetail[]> => {
      const start = dayjs()
      const resp: ShippopGetPriceDetail[] = []

      const product = {
        weight: 0,
        width: 0,
        length: 0,
        height: 0,
      }

      for (const p of products) {
        product.weight += p.weight
        product.width += p.width
        product.length += p.length
        product.height += p.height
      }

      const params = {
        api_key: process.env.SHIPPOP_API_KEY,
        data: [
          {
            from: {
              name: fromAddress.name,
              address: fromAddress.address,
              district: fromAddress.tambon,
              state: fromAddress.district,
              province: fromAddress.province,
              postcode: fromAddress.postcode,
              tel: fromAddress.mobile,
            },
            to: {
              name: toAddress.name,
              address: toAddress.address,
              district: toAddress.tambon,
              state: toAddress.district,
              province: toAddress.province,
              postcode: toAddress.postcode,
              tel: toAddress.mobile,
            },
            parcel: {
              name: products[0].name,
              weight: product.weight.toString(),
              width: product.width.toString(),
              length: product.length.toString(),
              height: product.height.toString(),
            },
          },
        ],
      }

      const formDataParams = createFormData(params)
      const { data } = await api.shippop.post<ShippopGetPriceResponse>(
        'pricelist/',
        formDataParams,
        {
          contentType: ContentType.FORMDATA,
        },
      )

      if (data.data[0].tP2) {
        resp.push(data.data[0].tP2)
      }

      if (data.data[0].eMST) {
        resp.push(data.data[0].eMST)
      }

      if (data.data[0].kRYP) {
        resp.push(data.data[0].kRYP)
      }

      this.logger.info(
        `Done InquiryPriceFromShippopFunc ${dayjs().diff(start)} ms`,
      )
      return resp
    }
  }
}

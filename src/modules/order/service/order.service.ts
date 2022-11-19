import { Injectable } from '@nestjs/common'

import { PinoLogger } from 'nestjs-pino'

import {
  AddressToShippop,
  AdjustWalletToSellerType,
  CreateOrderToDbType,
  InquiryOrderShopByIdFuncType,
  InquiryOrderShopsFuncType,
  InquiryPriceFromShippopType,
  InquiryProducProfiletByIdType,
  InquiryProductByIdType,
  InquiryShopByIdType,
  InsertOrderShopProductToDbType,
  InsertOrderShopProductType,
  InsertOrderShopToDbType,
  InsertOrderToDbType,
  InsertPaymentByBankToDbType,
  InsertPaymentByEwalletToDbType,
  InsertPaymentByHappyToDbType,
  ProductForShippopGetPrice,
  ShippopGetPriceDetail,
  ShippopGetPriceResponse,
  UpdatePaymentIdToOrderType,
  UpdateStockToProductType,
  ValidateOrderParamsType,
} from '../type/order.type'

import { ContentType, createFormData } from 'src/utils/api/tools'
import { api } from 'src/utils/api'
import dayjs from 'dayjs'
import { InquiryVerifyOtpType } from 'src/modules/otp/type/otp.type'
import {
  AdjustWalletFuncType,
  InquiryWalletByShopIdType,
  InsertReferenceToDbFuncType,
  InsertTransactionToDbFuncType,
  UpdateReferenceToDbFuncType,
} from 'src/modules/wallet/type/wallet.type'
import {
  DebitHappyPointTransactionParams,
  DebitHappyPointType,
} from 'src/modules/happy-point/type/happy-point.type'
import { Wallet } from 'src/db/entities/Wallet'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { Member } from 'src/db/entities/Member'
import {
  InvalidOrderShopTotalOfProducts,
  InvalidOrderShopTotalOfShipping,
  InvalidTotalPriceOfProducts,
  UnableInquiryOrderShopById,
  UnableInquiryOrderShops,
  UnableInquiryProductById,
  UnableInquiryShopById,
  UnableToAdjustWalletToSeller,
  UnableToInsertOrder,
  UnableToInsertOrderShop,
  UnableToInsertOrderShopProduct,
  UnableToInsertPayment,
  UnableToUpdatePaymentIdToOrder,
  UnableToValidateOrder,
} from 'src/utils/response-code'
import { internalSeverError } from 'src/utils/response-error'
import { verifyOtpRequestDto } from 'src/modules/otp/dto/otp.dto'
import { response } from 'src/utils/response'
import { EntityManager, SelectQueryBuilder } from 'typeorm'
import { Order } from 'src/db/entities/Order'
import { Payment } from 'src/db/entities/Payment'
import { Shop } from 'src/db/entities/Shop'
import { OrderShop } from 'src/db/entities/OrderShop'
import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { OrderShopProduct } from 'src/db/entities/OrderShopProduct'
import {
  CreateOrderDto,
  GetOrderRequestDto,
  OrderShopDto,
  OrderShopProductDto,
} from '../dto/createOrder.dto'
import { paginate } from 'nestjs-typeorm-paginate'

@Injectable()
export class OrderService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(OrderService.name)
  }

  CheckoutHandler(
    createOrderTodb: CreateOrderToDbType,
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    debitHappyPoint: DebitHappyPointType,
    insertTransaction: Promise<InsertTransactionToDbFuncType>,
    insertTransactionReference: Promise<InsertReferenceToDbFuncType>,
    update3rdPartyTransactionReference: Promise<UpdateReferenceToDbFuncType>,
    adjustWallet: Promise<AdjustWalletFuncType>,
    insertPaymentByBankToDb: InsertPaymentByBankToDbType,
    insertPaymentByHappyToDb: InsertPaymentByHappyToDbType,
    insertPaymentByEwalletToDb: InsertPaymentByEwalletToDbType,
    updatePaymentIdToOrder: UpdatePaymentIdToOrderType,
    adjustWalletToSeller: AdjustWalletToSellerType,
  ) {
    return async (
      wallet: Wallet,
      happyPoint: HappyPoint,
      member: Member,
      body: CreateOrderDto,
    ) => {
      const start = dayjs()

      const [
        order,
        orderShopList,
        errorCodeCreateOrderTodb,
        errorMessageCreateOrderTodb,
      ] = await createOrderTodb(member.id, body)

      if (errorMessageCreateOrderTodb != '') {
        return response(
          undefined,
          errorCodeCreateOrderTodb,
          errorMessageCreateOrderTodb,
        )
      }

      let paymentOrder
      if (body.paymentType == 'bank') {
        if (body.bankPaymentId && body.qrCode && body.reference) {
          const [payment, insertPaymentError] = await insertPaymentByBankToDb(
            order.id,
            body,
          )

          if (insertPaymentError != '') {
            return internalSeverError(UnableToInsertPayment, insertPaymentError)
          }
          paymentOrder = payment
        } else {
          return internalSeverError(
            UnableToInsertPayment,
            'bankPaymentId, qrCode and reference not null',
          )
        }
      } else if (body.paymentType == 'happyPoint') {
        if (
          body.amountSell &&
          body.point &&
          body.refId &&
          body.totalAmount &&
          body.feeAmount &&
          body.refCode &&
          body.otpCode
        ) {
          if (happyPoint.balance < body.point) {
            return internalSeverError(
              UnableToInsertPayment,
              'Insufficient funds',
            )
          }

          const verifyOtpData: verifyOtpRequestDto = {
            reference: member.mobile,
            refCode: body.refCode,
            otpCode: body.otpCode,
          }

          const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
            await inquiryVerifyOtp
          )(verifyOtpData)

          if (verifyOtpErrorCode != 0) {
            return response(
              undefined,
              verifyOtpErrorCode,
              verifyOtpErrorMessege,
            )
          }

          const params: DebitHappyPointTransactionParams = {
            point: body.point,
            totalAmount: body.totalAmount,
            feeAmount: body.feeAmount,
            amount: body.amountSell,
            refId: body.refId,
            transactionType: 'PAYMENT',
            orderId: order.id,
          }

          const [
            respHappyPoint,
            errorCodeDebitHappyPoint,
            errorMessageDebitHappyPoint,
          ] = await debitHappyPoint(happyPoint, params)

          if (errorCodeDebitHappyPoint != 0) {
            return response(
              undefined,
              errorCodeDebitHappyPoint,
              errorMessageDebitHappyPoint,
            )
          }

          const [payment, insertPaymentError] = await insertPaymentByHappyToDb(
            order.id,
            respHappyPoint.id,
            body,
          )

          if (insertPaymentError != '') {
            return internalSeverError(UnableToInsertPayment, insertPaymentError)
          }

          paymentOrder = payment
        } else {
          return internalSeverError(
            UnableToInsertPayment,
            'amountSell, point, refId, totalAmount, feeAmount, refCode and otpCode not null',
          )
        }
      } else if (body.paymentType == 'ewallet') {
        if (body.amountSell && body.refId) {
          if (wallet.balance < body.amountSell) {
            return internalSeverError(
              UnableToInsertPayment,
              'Insufficient funds',
            )
          }

          const params = {
            walletId: wallet.id,
            amount: body.amountSell,
            thirdPtReferenceNo: body.refId,
            detail: 'buy',
          }

          const [walletTransaction, insertTransactionError] = await (
            await insertTransaction
          )(params.walletId, params.amount, 0, params.detail, 'buy')

          if (insertTransactionError != '') {
            return [undefined, insertTransactionError]
          }

          const [referenceNo, insertReferenceError] = await (
            await insertTransactionReference
          )(walletTransaction)

          if (insertReferenceError != '') {
            return [undefined, insertReferenceError]
          }

          const [, insertDepositReferenceError] = await (
            await update3rdPartyTransactionReference
          )(
            referenceNo,
            params.thirdPtReferenceNo,
            params.amount,
            params.detail,
          )

          if (insertDepositReferenceError != '') {
            return [undefined, insertDepositReferenceError]
          }

          const [, adjustWalletError] = await (await adjustWallet)(
            params.walletId,
            params.amount,
            'buy',
          )

          if (adjustWalletError != '') {
            return [undefined, adjustWalletError]
          }

          const [
            payment,
            insertPaymentError,
          ] = await insertPaymentByEwalletToDb(
            order.id,
            walletTransaction.id,
            body,
          )

          if (insertPaymentError != '') {
            return internalSeverError(UnableToInsertPayment, insertPaymentError)
          }

          paymentOrder = payment
        } else {
          return internalSeverError(
            UnableToInsertPayment,
            'amountSell and refId not null',
          )
        }
      }

      const updatePaymentIdToOrderError = await updatePaymentIdToOrder(
        order.id,
        paymentOrder.id,
      )

      if (updatePaymentIdToOrderError != '') {
        return internalSeverError(
          UnableToUpdatePaymentIdToOrder,
          updatePaymentIdToOrderError,
        )
      }

      const adjustWalletToSellerError = await adjustWalletToSeller(
        orderShopList,
        body.refId,
      )

      if (adjustWalletToSellerError != '') {
        return internalSeverError(
          UnableToAdjustWalletToSeller,
          adjustWalletToSellerError,
        )
      }

      this.logger.info(`Done CheckoutHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  CreateOrderToDbFunc(
    inquiryShopById: InquiryShopByIdType,
    inquiryProductById: InquiryProductByIdType,
    insertOrderToDb: InsertOrderToDbType,
    insertOrderShopToDb: InsertOrderShopToDbType,
    insertOrderShopProduct: InsertOrderShopProductType,
  ): CreateOrderToDbType {
    return async (
      memberId: string,
      body: CreateOrderDto,
    ): Promise<[Order, OrderShop[], number, string]> => {
      const orderShopList: OrderShop[] = []
      const [order, insertOrderError] = await insertOrderToDb(memberId, body)

      if (insertOrderError != '') {
        return [order, orderShopList, UnableToInsertOrder, insertOrderError]
      }

      let priceShop = 0
      let priceShippingShop = 0
      for (const x in body.orderShop) {
        const orderShopRequest = body.orderShop[x]

        const [, inquiryShopByIdError] = await inquiryShopById(
          orderShopRequest.shopId,
        )
        if (inquiryShopByIdError != '') {
          return [
            order,
            orderShopList,
            UnableInquiryShopById,
            inquiryShopByIdError,
          ]
        }

        const [orderShop, insertOrderShopError] = await insertOrderShopToDb(
          order.id,
          orderShopRequest,
        )

        if (insertOrderShopError != '') {
          return [
            order,
            orderShopList,
            UnableToInsertOrderShop,
            insertOrderShopError,
          ]
        }
        orderShopList.push(orderShop)

        let priceProduct = 0
        for (const x in orderShopRequest.orderShopProduct) {
          const orderShopProductRequest = orderShopRequest.orderShopProduct[x]

          const productId = orderShopProductRequest.productId
          const [, inquiryProductByIdError] = await inquiryProductById(
            productId,
          )

          if (inquiryProductByIdError != '') {
            return [
              order,
              orderShopList,
              UnableInquiryProductById,
              inquiryProductByIdError,
            ]
          }

          const [
            ,
            insertOrderShopProductServiceError,
          ] = await insertOrderShopProduct(
            orderShop.id,
            orderShopProductRequest,
          )

          if (insertOrderShopProductServiceError != '') {
            return [
              order,
              orderShopList,
              UnableToInsertOrderShopProduct,
              insertOrderShopProductServiceError,
            ]
          }

          priceProduct +=
            orderShopProductRequest.units * orderShopProductRequest.unitPrice
        }

        if (orderShop.orderShopAmount != priceProduct) {
          return [
            order,
            orderShopList,
            InvalidTotalPriceOfProducts,
            'Validate order false because orderShopAmount is incorrect',
          ]
        }
        priceShop += orderShop.orderShopAmount
        priceShippingShop += orderShop.shippingPrice

        if (body.merchandiseSubtotal != priceShop) {
          return [
            order,
            orderShopList,
            InvalidOrderShopTotalOfProducts,
            'Validate order false because merchandiseSubtotal  are incorrect',
          ]
        }

        if (body.shippingTotal != priceShippingShop) {
          return [
            order,
            orderShopList,
            InvalidOrderShopTotalOfShipping,
            'Validate order false because shippingTotal are incorrect',
          ]
        }
      }
      return [order, orderShopList, 0, '']
    }
  }

  InsertOrderShopProductFunc(
    inquiryProductById: InquiryProductByIdType,
    updateStockToProduct: UpdateStockToProductType,
    inquiryProductProfileById: InquiryProducProfiletByIdType,
    insertOrderShopProductToDb: InsertOrderShopProductToDbType,
  ): InsertOrderShopProductType {
    return async (orderShopId: string, params: OrderShopProductDto) => {
      const start = dayjs()

      const [product, inquiryProductByIdError] = await inquiryProductById(
        params.productId,
      )

      if (inquiryProductByIdError != '') {
        return [undefined, inquiryProductByIdError]
      }

      const stock = product.stock - params.units
      const sold =
        params.unitPrice * params.units + parseFloat(product.sold.toString())
      const amountSold = product.amountSold + params.units

      const updateStockToProductError = await updateStockToProduct(
        product.id,
        stock,
        sold,
        amountSold,
      )

      if (updateStockToProductError != '') {
        return [undefined, updateStockToProductError]
      }

      const [
        productProfile,
        inquiryProductProfileByIdError,
      ] = await inquiryProductProfileById(product.productProfileId)

      if (inquiryProductProfileByIdError != '') {
        return [undefined, inquiryProductProfileByIdError]
      }

      const [
        orderShopProduct,
        insertOrderShopProductError,
      ] = await insertOrderShopProductToDb(orderShopId, params, productProfile)

      if (insertOrderShopProductError != '') {
        return [undefined, insertOrderShopProductError]
      }

      this.logger.info(
        `Done InsertOrderShopProductFunc ${dayjs().diff(start)} ms`,
      )
      return [orderShopProduct, '']
    }
  }

  InquiryShopByIdFunc(etm: EntityManager): InquiryShopByIdType {
    return async (shopId: string): Promise<[Shop, string]> => {
      const start = dayjs()
      let shop: Shop
      try {
        shop = await etm.findOne(Shop, shopId, { withDeleted: false })
      } catch (error) {
        return error.message
      }

      if (!shop) {
        return [, 'Not found shop']
      }

      this.logger.info(`Done InquiryShopByIdFunc ${dayjs().diff(start)} ms`)
      return [shop, '']
    }
  }

  InsertOrderToDbFunc(etm: EntityManager): InsertOrderToDbType {
    return async (
      memberId: string,
      createOrderParams: CreateOrderDto,
    ): Promise<[Order, string]> => {
      const start = dayjs()
      const {
        happyVoucherId,
        totalPriceOfProducts,
        totalPriceOfShippings,
        discount,
        totalPrice,
        name,
        address,
        tambon,
        district,
        province,
        postcode,
        mobile,
      } = createOrderParams

      const status = 'toPay'

      let order: Order
      try {
        order = etm.create(Order, {
          happyVoucherId,
          totalPriceOfProducts,
          totalPriceOfShippings,
          discount,
          totalPrice,
          name,
          address,
          tambon,
          district,
          province,
          postcode,
          mobile,
          memberId,
          status,
        })

        await etm.save(order)
      } catch (error) {
        return [order, error.message]
      }

      this.logger.info(`Done InsertOrderToDbFunc ${dayjs().diff(start)} ms`)
      return [order, '']
    }
  }

  AdjustWalletToSellerFunc(
    inquiryWalletByShopId: InquiryWalletByShopIdType,
    insertTransaction: Promise<InsertTransactionToDbFuncType>,
    insertTransactionReference: Promise<InsertReferenceToDbFuncType>,
    update3rdPartyTransactionReference: Promise<UpdateReferenceToDbFuncType>,
    adjustWallet: Promise<AdjustWalletFuncType>,
  ): AdjustWalletToSellerType {
    return async (
      orderShopList: OrderShop[],
      refId: string,
    ): Promise<string> => {
      const start = dayjs()

      for (const x in orderShopList) {
        const orderShop = orderShopList[x]

        const [
          walletShop,
          inquiryWalletByShopIdError,
        ] = await inquiryWalletByShopId(orderShop.shopId)

        if (inquiryWalletByShopIdError != '') {
          return inquiryWalletByShopIdError
        }

        const [walletTransaction, insertTransactionError] = await (
          await insertTransaction
        )(
          walletShop.id,
          orderShop.totalPrice,
          0,
          'deposit',
          'deposit',
          undefined,
          orderShop.id,
        )

        if (insertTransactionError != '') {
          return insertTransactionError
        }

        const [referenceNo, insertReferenceError] = await (
          await insertTransactionReference
        )(walletTransaction)

        if (insertReferenceError != '') {
          return insertReferenceError
        }

        const [, insertDepositReferenceError] = await (
          await update3rdPartyTransactionReference
        )(referenceNo, refId, orderShop.totalPrice, 'deposit')

        if (insertDepositReferenceError != '') {
          return insertDepositReferenceError
        }

        const [, adjustedWalletSellerError] = await (await adjustWallet)(
          walletShop.id,
          parseFloat(orderShop.totalPrice.toString()),
          'deposit',
        )

        if (adjustedWalletSellerError != '') {
          return adjustedWalletSellerError
        }
      }

      this.logger.info(
        `Done AdjustWalletToSellerFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  UpdatePaymentIdToOrderFunc(etm: EntityManager): UpdatePaymentIdToOrderType {
    return async (orderId: string, paymentId: string): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Order, orderId, { paymentId })
      } catch (error) {
        console.log('error.message : ', error.message)
        return error.message
      }

      this.logger.info(
        `Done UpdatePaymentIdToOrderFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  InsertOrderShopToDbFunc(etm: EntityManager): InsertOrderShopToDbType {
    return async (
      orderId: string,
      params: OrderShopDto,
    ): Promise<[OrderShop, string]> => {
      const start = dayjs()
      const {
        shippingOptionId,
        totalPriceOfProducts,
        shopId,
        shopVoucherId,
        note,
        totalPriceOfShippings,
        minDeliverDate,
        maxDeliverDate,
      } = params

      const status = 'toPay'

      let orderShop: OrderShop
      try {
        orderShop = etm.create(OrderShop, {
          shippingOptionId,
          totalPriceOfProducts,
          shopId,
          shopVoucherId,
          note,
          totalPriceOfShippings,
          minDeliverDate,
          maxDeliverDate,
          orderId,
          status,
        })

        await etm.save(orderShop)
      } catch (error) {
        return [orderShop, error.message]
      }

      this.logger.info(`Done InsertOrderShopToDbFunc ${dayjs().diff(start)} ms`)
      return [orderShop, '']
    }
  }

  InquiryProductByIdFunc(etm: EntityManager): InquiryProductByIdType {
    return async (productId: string): Promise<[Product, string]> => {
      const start = dayjs()
      let product: Product
      try {
        product = await etm.findOne(Product, productId, { withDeleted: false })
      } catch (error) {
        return [product, error.message]
      }

      if (!product) {
        return [product, 'Not found product']
      }

      this.logger.info(`Done InquiryProductByIdFunc ${dayjs().diff(start)} ms`)
      return [product, '']
    }
  }

  InquiryProductProfileByIdFunc(
    etm: EntityManager,
  ): InquiryProducProfiletByIdType {
    return async (
      productProfileId: string,
    ): Promise<[ProductProfile, string]> => {
      const start = dayjs()
      let productProfile: ProductProfile
      try {
        productProfile = await etm.findOne(ProductProfile, productProfileId, {
          withDeleted: false,
        })
      } catch (error) {
        return [productProfile, error.message]
      }

      if (!productProfile) {
        return [productProfile, 'Not found productProfile']
      }

      this.logger.info(
        `Done InquiryProductProfileByIdFunc ${dayjs().diff(start)} ms`,
      )
      return [productProfile, '']
    }
  }

  InsertOrderShopProductToDbFunc(
    etm: EntityManager,
  ): InsertOrderShopProductToDbType {
    return async (
      orderShopId: string,
      params: OrderShopProductDto,
      productProfile: ProductProfile,
    ): Promise<[OrderShopProduct, string]> => {
      const start = dayjs()
      const {
        unitPrice,
        units,
        productProfileName,
        productProfileImage,
        productId,
        productOptions1,
        productOptions2,
      } = params

      const status = 'toPay'
      const productProfileJson = JSON.stringify(productProfile)

      let orderShopProduct: OrderShopProduct
      try {
        orderShopProduct = etm.create(OrderShopProduct, {
          unitPrice,
          units,
          productProfileName,
          productProfileImage,
          productId,
          productOptions1,
          productOptions2,
          status,
          orderShopId,
          productProfileJson,
        })

        await etm.save(orderShopProduct)
      } catch (error) {
        return [orderShopProduct, error.message]
      }

      this.logger.info(
        `Done InsertOrderShopProductToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [orderShopProduct, '']
    }
  }

  UpdateStockToProductFunc(etm: EntityManager): UpdateStockToProductType {
    return async (
      productId: string,
      stock: number,
      sold: number,
      amountSold: number,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Product, productId, { stock, sold, amountSold })
      } catch (error) {
        return error.message
      }

      this.logger.info(
        `Done UpdateStockToProductFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
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

  GetOrderShopsHandler(inquiryOrders: Promise<InquiryOrderShopsFuncType>) {
    return async (member: Member, query: GetOrderRequestDto) => {
      const start = dayjs()
      const { limit = 10, page = 1, keyword, status } = query

      const [ordersQuery, inquiryOrdersError] = await (await inquiryOrders)(
        member.id,
        keyword,
        status,
      )

      if (inquiryOrdersError != '') {
        return response(undefined, UnableInquiryOrderShops, inquiryOrdersError)
      }

      const result = await paginate<OrderShop>(ordersQuery, {
        limit,
        page,
      })
      this.logger.info(`Done GetOrdersHandler ${dayjs().diff(start)} ms`)
      return response(result)
    }
  }

  async InquiryOrderShopsFunc(
    etm: EntityManager,
  ): Promise<InquiryOrderShopsFuncType> {
    return async (
      memberId: string,
      keyword?: string,
      status?: string,
    ): Promise<[SelectQueryBuilder<OrderShop>, string]> => {
      const start = dayjs()
      let orderShopsQuery: SelectQueryBuilder<OrderShop>
      const condition: any = {
        order: {
          memberId,
          deletedAt: null,
        },
      }

      if (status) {
        condition.status = status
      }

      try {
        orderShopsQuery = etm
          .createQueryBuilder(OrderShop, 'orderShops')
          .innerJoin(`orderShops.orderShopProduct`, 'products')
          .leftJoin(`orderShops.shop`, 'shop')
          .leftJoin(`orderShops.order`, 'order')
          .select([
            'orderShops',
            'order',
            'products',
            'shop.id',
            'shop.shopName',
          ])
          .where(condition)
        if (keyword) {
          const keywordCondition =
            '(shop.fullName LIKE :keyword OR products.productProfileName LIKE :keyword OR orderShops.orderNumber LIKE :keyword)'
          orderShopsQuery = orderShopsQuery.andWhere(keywordCondition, {
            keyword: `%${keyword}%`,
          })
        }
      } catch (error) {
        return [orderShopsQuery, error.message]
      }
      this.logger.info(`Done InquiryOrderShopsFunc ${dayjs().diff(start)} ms`)
      return [orderShopsQuery, '']
    }
  }

  GetOrderShopByIdHandler(
    inquiryOrderById: Promise<InquiryOrderShopByIdFuncType>,
  ) {
    return async (member: Member, orderShopId: string) => {
      const start = dayjs()
      const [orderShop, inquiryOrderShopByIdError] = await (
        await inquiryOrderById
      )(member.id, orderShopId)

      if (inquiryOrderShopByIdError != '') {
        return response(
          undefined,
          UnableInquiryOrderShopById,
          inquiryOrderShopByIdError,
        )
      }

      this.logger.info(`Done GetOrderByIdHandler ${dayjs().diff(start)} ms`)
      return response(orderShop)
    }
  }

  async InquiryOrderShopByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryOrderShopByIdFuncType> {
    return async (
      memberId: string,
      orderId: string,
    ): Promise<[OrderShop, string]> => {
      const start = dayjs()
      let orderShop: OrderShop

      try {
        orderShop = await etm
          .createQueryBuilder(OrderShop, 'orderShops')
          .innerJoin(`orderShops.orderShopProduct`, 'products')
          .leftJoin(`orderShops.shop`, 'shop')
          .leftJoin(`orderShops.order`, 'order')
          .select([
            'orderShops',
            'order',
            'products',
            'shop.id',
            'shop.shopName',
          ])
          .where({
            id: orderId,
            order: {
              memberId,
            },
            deletedAt: null,
          })
          .getOne()

        if (!orderShop) {
          return [orderShop, 'Order-shop is not found']
        }
      } catch (error) {
        return [orderShop, error.message]
      }
      this.logger.info(
        `Done InquiryOrderShopByIdFunc ${dayjs().diff(start)} ms`,
      )
      return [orderShop, '']
    }
  }
}

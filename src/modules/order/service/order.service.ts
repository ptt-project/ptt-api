import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

import {
  CreateOrderToDbType,
  InquiryOrderShopByIdFuncType,
  InquiryOrderShopsFuncType,
  InquiryShopByIdType,
  InsertOrderShopProductToDbType,
  InsertOrderShopProductType,
  InsertOrderShopToDbType,
  InsertOrderToDbType,
  OrderShopPaginate,
  PaginateOrderShopsFuncType,
  UpdatePaymentIdAndStatusToOrderType,
  UpdateStockToProductType,
} from '../type/order.type'
import { InquiryVerifyOtpType } from 'src/modules/otp/type/otp.type'
import {
  DebitHappyPointTransactionParams,
  DebitHappyPointType,
} from 'src/modules/happy-point/type/happy-point.type'
import { Wallet } from 'src/db/entities/Wallet'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { Member } from 'src/db/entities/Member'
import {
  ErrorValidateParamsForPayment,
  InvalidOrderShopTotalOfProducts,
  InvalidOrderShopTotalOfShipping,
  InvalidTotalPriceOfProducts,
  UnableInquiryOrderShopById,
  UnableInquiryOrderShops,
  UnableInquiryProductById,
  UnableInquiryShopById,
  UnablePaginateOrderShops,
  UnableToAdjustWalletToBuyer,
  UnableToAdjustWalletToSeller,
  UnableToInsertOrder,
  UnableToInsertOrderShop,
  UnableToInsertOrderShopProduct,
  UnableToUpdatePaymentIdAndStatusToOrder,
} from 'src/utils/response-code'
import { verifyOtpRequestDto } from 'src/modules/otp/dto/otp.dto'
import { response } from 'src/utils/response'
import { EntityManager, SelectQueryBuilder } from 'typeorm'
import { Order, OrderStatusType } from 'src/db/entities/Order'
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
import { InsertPaymentToDbType } from 'src/modules/payment/type/payment.type'
import {
  AdjustWalletToBuyerParams,
  AdjustWalletToBuyerType,
  AdjustWalletToSellerParams,
  AdjustWalletToSellerType,
} from 'src/modules/wallet/type/wallet.type'

import { InsertPaymentParams } from '../../payment/type/payment.type'
import { PaymentStatusType } from 'src/db/entities/Payment'
import {
  InquiryProducProfiletByIdType,
  InquiryProductByIdParams,
  InquiryProductByIdType,
} from '../type/product.type'
import { genOrderNumber } from 'src/utils/helpers'
import dayjs from 'dayjs'

@Injectable()
export class OrderService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(OrderService.name)
  }

  CheckoutHandler(
    createOrderTodb: CreateOrderToDbType,
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    debitHappyPoint: DebitHappyPointType,
    adjustWalletToBuyer: AdjustWalletToBuyerType,
    insertPaymentToDb: InsertPaymentToDbType,
    updatePaymentIdAndStatusToOrder: UpdatePaymentIdAndStatusToOrderType,
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
        orderShops,
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

      let errorMessage = ''
      let paymentableId = ''
      let orderStatus: OrderStatusType = 'WAITING_PAYMENT'
      let statusPayment: PaymentStatusType = 'COMPLETED'

      const {
        paymentType,
        reference,
        qrCode,
        refId,
        refCode,
        otpCode,
        totalPrice,
        amountOfHappyPoint,
      } = body

      if (paymentType == 'BANK') {
        if (!reference) {
          errorMessage = 'reference not null'
        } else if (!qrCode) {
          errorMessage = 'qrCode not null'
        }

        statusPayment = 'WAITING_PAYMENT'
        paymentableId = reference
      } else if (paymentType == 'HAPPYPOINT') {
        if (!amountOfHappyPoint) {
          errorMessage = 'amountOfHappyPoint not null'
        } else if (!refId) {
          errorMessage = 'refId not null'
        } else if (!refCode) {
          errorMessage = 'refCode not null'
        } else if (!otpCode) {
          errorMessage = 'refCode not null'
        }

        const verifyOtpData: verifyOtpRequestDto = {
          reference: member.mobile,
          refCode: refCode,
          otpCode: otpCode,
        }

        const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
          await inquiryVerifyOtp
        )(verifyOtpData)

        if (verifyOtpErrorCode != 0) {
          return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
        }

        const params: DebitHappyPointTransactionParams = {
          refId,
          point: amountOfHappyPoint,
          feeAmount: 0,
          orderId: order.id,
          totalAmount: totalPrice,
          amount: totalPrice,
          transactionType: 'PAYMENT',
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

        orderStatus = 'PAID'
        paymentableId = respHappyPoint.id
      } else if (paymentType == 'EWALLET') {
        const adjustWalletToBuyerParams: AdjustWalletToBuyerParams = {
          totalPrice,
          code: order.code,
          walletId: wallet.id,
        }

        const [
          walletTransaction,
          errorAdjustWalletToBuyer,
        ] = await adjustWalletToBuyer(adjustWalletToBuyerParams)
        if (errorAdjustWalletToBuyer != '') {
          return response(
            undefined,
            UnableToAdjustWalletToBuyer,
            errorAdjustWalletToBuyer,
          )
        }

        orderStatus = 'PAID'
        paymentableId = walletTransaction.id
      }

      if (errorMessage != '') {
        return response(undefined, ErrorValidateParamsForPayment, errorMessage)
      }

      const insertPaymentParams: InsertPaymentParams = {
        qrCode,
        orderId: order.id,
        status: statusPayment,
        paymentableType: paymentType,
        paymentableId,
      }

      const [payment, errorInsertPaymentToDb] = await insertPaymentToDb(
        insertPaymentParams,
      )
      if (errorInsertPaymentToDb != '') {
      }

      const updatePaymentIdAndStatusToOrderError = await updatePaymentIdAndStatusToOrder(
        order.id,
        payment.id,
        orderStatus,
      )

      if (updatePaymentIdAndStatusToOrderError != '') {
        return response(
          undefined,
          UnableToUpdatePaymentIdAndStatusToOrder,
          updatePaymentIdAndStatusToOrderError,
        )
      }
      const paramsAdjustWalletToSeller: AdjustWalletToSellerParams = {
        orderShops,
      }

      const adjustWalletToSellerError = await adjustWalletToSeller(
        paramsAdjustWalletToSeller,
      )

      if (adjustWalletToSellerError != '') {
        return response(
          undefined,
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
        for (const orderShopProductRequest of orderShopRequest.orderShopProduct) {
          const {
            productId,
            productOptions1,
            productOptions2,
          } = orderShopProductRequest

          const paramsInquiryProductById: InquiryProductByIdParams = {
            productId,
            productOptions1,
            productOptions2,
          }
          const [, inquiryProductByIdError] = await inquiryProductById(
            paramsInquiryProductById,
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

        if (orderShop.totalPriceOfProducts != priceProduct) {
          return [
            order,
            orderShopList,
            InvalidTotalPriceOfProducts,
            'Validate order false because orderShopAmount is incorrect',
          ]
        }
        priceShop += orderShop.totalPriceOfProducts
        priceShippingShop += orderShop.totalPriceOfShippings

        if (body.totalPriceOfProducts != priceShop) {
          return [
            order,
            orderShopList,
            InvalidOrderShopTotalOfProducts,
            'Validate order false because merchandiseSubtotal  are incorrect',
          ]
        }

        if (body.totalPriceOfShippings != priceShippingShop) {
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

      const { productId, productOptions1, productOptions2 } = params

      const paramsInquiryProductById: InquiryProductByIdParams = {
        productId,
        productOptions1,
        productOptions2,
      }

      const [product, inquiryProductByIdError] = await inquiryProductById(
        paramsInquiryProductById,
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
          code: genOrderNumber(),
          status: 'WAITING_PAYMENT',
        })

        await etm.save(order)
      } catch (error) {
        return [order, error.message]
      }

      this.logger.info(`Done InsertOrderToDbFunc ${dayjs().diff(start)} ms`)
      return [order, '']
    }
  }

  UpdatePaymentIdAndStatusToOrderFunc(
    etm: EntityManager,
  ): UpdatePaymentIdAndStatusToOrderType {
    return async (
      orderId: string,
      paymentId: string,
      status: OrderStatusType,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Order, orderId, {
          status,
          paymentId,
        })
      } catch (error) {
        console.log('error.message : ', error.message)
        return error.message
      }

      this.logger.info(
        `Done UpdatePaymentIdAndStatusToOrderFunc ${dayjs().diff(start)} ms`,
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
        totalPrice,
        shippingOptionId,
        totalPriceOfProducts,
        shopId,
        shopVoucherId,
        note,
        totalPriceOfShippings,
        minDeliverDate,
        maxDeliverDate,
        discount,
      } = params

      const status = 'BOOKING'

      let orderShop: OrderShop
      try {
        orderShop = etm.create(OrderShop, {
          totalPrice,
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
          discount: discount ? discount : 0,
          code: genOrderNumber(),
        })

        await etm.save(orderShop)
      } catch (error) {
        return [orderShop, error.message]
      }

      this.logger.info(`Done InsertOrderShopToDbFunc ${dayjs().diff(start)} ms`)
      return [orderShop, '']
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
        productId,
        productOptions1,
        productOptions2,
      } = params

      console.log('productProfile', productProfile)

      const productProfileJson = JSON.stringify(productProfile)

      const productProfileName = productProfile.name
      const productProfileImage =
        productProfile.imageIds && productProfile.imageIds.length > 0
          ? productProfile.imageIds[0]
          : undefined

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

  GetOrderShopsHandler(
    inquiryOrders: InquiryOrderShopsFuncType,
    paginateOrderShop: PaginateOrderShopsFuncType,
  ) {
    return async (
      member: Member,
      query: GetOrderRequestDto,
    ) => {
      const start = dayjs()
      const { limit = 10, page = 1, keyword, status } = query

      const [ordersQuery, inquiryOrdersError] = await inquiryOrders(member.id, keyword, status)

      if (inquiryOrdersError != '') {
        return response(
          undefined,
          UnableInquiryOrderShops,
          inquiryOrdersError,
        )
      }

      const [result, paginateError] = await paginateOrderShop(
        ordersQuery,
        limit,
        page,
      )

      if (paginateError != '') {
        return response(
          undefined,
          UnablePaginateOrderShops,
          paginateError,
        )
      }

      this.logger.info(`Done GetOrderShopsHandler ${dayjs().diff(start)} ms`)
      return response(result)
    }
  }

  InquiryOrderShopsFunc(
    etm: EntityManager,
  ): InquiryOrderShopsFuncType {
    return async (memberId: string, keyword?: string, status?: string): Promise<[SelectQueryBuilder<OrderShop>, string]> => {
      const start = dayjs()
      let orderShopsQuery: SelectQueryBuilder<OrderShop>
      const condition:any = {
        order: {
          memberId,
          deletedAt: null,
        }
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
          const keywordCondition = "(shop.fullName LIKE :keyword OR products.productProfileName LIKE :keyword OR orderShops.orderNumber LIKE :keyword)"
          orderShopsQuery = orderShopsQuery.andWhere(keywordCondition, { keyword: `%${keyword}%` })
        }
        orderShopsQuery = orderShopsQuery.orderBy('order.createdAt', 'DESC')

      } catch(error) {
        return [orderShopsQuery, error.message]
      }
      this.logger.info(
        `Done InquiryOrderShopsFunc ${dayjs().diff(start)} ms`,
      )
      return [orderShopsQuery, '']
    }
  }

  PaginateOrderShopsFunc(): PaginateOrderShopsFuncType {
    return async (orderShopsQuery: SelectQueryBuilder<OrderShop>, limit: number, page: number): Promise<[OrderShopPaginate, string]> => {
      const start = dayjs()
      let result: OrderShopPaginate = {
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        }
      }

      try {
        const orderShops = await orderShopsQuery.getMany()
        const toPayOrderDictionary = orderShops.reduce((dictionary, orderShop) => {
          if (orderShop.order.status == 'WAITING_PAYMENT') {
            if (!dictionary[orderShop.orderId]) {
              dictionary[orderShop.orderId] = {
                ...orderShop.order,
                orderShops: []
              }
            }
            dictionary[orderShop.orderId].orderShops.push(orderShop)
          }

          return dictionary
        }, {})

        const toPayItems = Object.keys(toPayOrderDictionary).map(
          (orderId) => toPayOrderDictionary[orderId]
        )

        const notTopayItems = orderShops.reduce((result, orderShop) => {
          if (orderShop.order.status != 'WAITING_PAYMENT') {
            result.push(orderShop)
          }

          return result
        }, [])

        const items = [...toPayItems, ...notTopayItems]
        const slicedItem = items.slice((page - 1) * limit, page * limit)

        result = {
          items: slicedItem,
          meta: {
            totalItems: items.length,
            itemCount: slicedItem.length,
            itemsPerPage: limit,
            totalPages: Math.ceil(items.length / limit),
            currentPage: page,
          }
        }

      } catch(error) {
        return [result, error.message]
      }
      this.logger.info(
        `Done PaginateOrderShopsFunc ${dayjs().diff(start)} ms`,
      )
      return [result, '']
    }
  }

  GetOrderShopByIdHandler(
    inquiryOrderById: InquiryOrderShopByIdFuncType
  ) {
    return async (
      member: Member,
      orderShopId: string,
    ) => {
      const start = dayjs()
      const [orderShop, inquiryOrderShopByIdError] = await inquiryOrderById(member.id, orderShopId)

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

  InquiryOrderShopByIdFunc(
    etm: EntityManager,
  ): InquiryOrderShopByIdFuncType {
    return async (memberId: string, orderId: string): Promise<[OrderShop, string]> => {
      const start = dayjs()
      let orderShop: OrderShop

      try {
        orderShop = await etm.createQueryBuilder(OrderShop, 'orderShops')
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
            memberId
          },
          deletedAt: null,
        }).getOne()

        if (!orderShop) {
          return [orderShop, "Order-shop is not found"]
        }
        
      } catch(error) {
        return [orderShop, error.message]
      }
      this.logger.info(
        `Done InquiryOrderShopByIdFunc ${dayjs().diff(start)} ms`,
      )
      return [orderShop, '']
    }
  }
}

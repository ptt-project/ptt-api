import { Injectable } from '@nestjs/common'

import { PinoLogger } from 'nestjs-pino'

import {
  AddressToShippop,
  AdjustWalletToSellerType,
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
import { EntityManager } from 'typeorm'
import { Order } from 'src/db/entities/Order'
import { Payment } from 'src/db/entities/Payment'
import { Shop } from 'src/db/entities/Shop'
import { OrderShop } from 'src/db/entities/OrderShop'
import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { OrderShopProduct } from 'src/db/entities/OrderShopProduct'
import {
  CreateOrderDto,
  OrderShopDto,
  OrderShopProductDto,
} from '../dto/createOrder.dto'

@Injectable()
export class OrderService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(OrderService.name)
  }

  CheckoutHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    validateOrderParams: ValidateOrderParamsType,
    insertOrderToDb: InsertOrderToDbType,
    insertOrderShopToDb: InsertOrderShopToDbType,
    insertOrderShopProduct: InsertOrderShopProductType,
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

      const validateOrderError = await validateOrderParams(body)

      if (validateOrderError != '') {
        return internalSeverError(UnableToValidateOrder, validateOrderError)
      }

      const [order, insertOrderError] = await insertOrderToDb(member.id, body)

      if (insertOrderError != '') {
        return internalSeverError(UnableToInsertOrder, insertOrderError)
      }

      const orderShopList: OrderShop[] = []

      for (const x in body.orderShop) {
        const orderShopRequest = body.orderShop[x]

        const [orderShop, insertOrderShopError] = await insertOrderShopToDb(
          order.id,
          orderShopRequest,
        )

        if (insertOrderShopError != '') {
          return internalSeverError(
            UnableToInsertOrderShop,
            insertOrderShopError,
          )
        }
        orderShopList.push(orderShop)

        for (const x in orderShopRequest.orderShopProduct) {
          const orderShopProductRequest = orderShopRequest.orderShopProduct[x]

          const [
            ,
            insertOrderShopProductServiceError,
          ] = await insertOrderShopProduct(
            orderShop.id,
            orderShopProductRequest,
          )

          if (insertOrderShopProductServiceError != '') {
            return internalSeverError(
              UnableToInsertOrderShopProduct,
              insertOrderShopProductServiceError,
            )
          }
        }
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
            UnableToInsertOrder,
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
          ] = await debitHappyPoint(wallet, happyPoint, params)

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
            UnableToInsertOrder,
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
            UnableToInsertOrder,
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

      const adjustWalletError = await adjustWalletToSeller(
        orderShopList,
        body.refId,
      )

      if (adjustWalletError != '') {
        return internalSeverError(undefined, adjustWalletError)
      }

      this.logger.info(`Done CheckoutHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
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

  ValidateOrderParamsFunc(
    inquiryShopById: InquiryShopByIdType,
    inquiryProductById: InquiryProductByIdType,
  ): ValidateOrderParamsType {
    return async (body: CreateOrderDto): Promise<string> => {
      const start = dayjs()

      let priceShop = 0
      let priceShippingShop = 0

      for (const x in body.orderShop) {
        const orderShop = body.orderShop[x]

        let priceProduct = 0

        const shopId = orderShop.shopId
        const [, inquiryShopByIdError] = await inquiryShopById(shopId)

        if (inquiryShopByIdError != '') {
          return inquiryShopByIdError
        }

        for (const x in orderShop.orderShopProduct) {
          const orderShopProduct = orderShop.orderShopProduct[x]

          const productId = orderShopProduct.productId
          const [, inquiryProductByIdError] = await inquiryProductById(
            productId,
          )

          if (inquiryProductByIdError != '') {
            return inquiryProductByIdError
          }

          priceProduct += orderShopProduct.units * orderShopProduct.unitPrice
        }

        if (orderShop.orderShopAmount != priceProduct) {
          return 'Validate order false because orderShopAmount is incorrect'
        }

        priceShop += orderShop.orderShopAmount
        priceShippingShop += orderShop.shippingPrice
      }

      if (
        body.merchandiseSubtotal != priceShop ||
        body.shippingTotal != priceShippingShop
      ) {
        return 'Validate order false because merchandiseSubtotal or shippingTotal are incorrect'
      }

      this.logger.info(`Done ValidateOrderParamsFunc ${dayjs().diff(start)} ms`)
      return ''
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
        merchandiseSubtotal,
        shippingTotal,
        discount,
        amount,
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
          merchandiseSubtotal,
          shippingTotal,
          discount,
          amount,
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

  InsertPaymentByBankToDbFunc(etm: EntityManager): InsertPaymentByBankToDbType {
    return async (
      orderId: string,
      createOrderParams: CreateOrderDto,
    ): Promise<[Payment, string]> => {
      const start = dayjs()
      const {
        paymentType,
        bankPaymentId,
        qrCode,
        reference,
      } = createOrderParams

      const status = 'toPay'

      let payment: Payment
      try {
        payment = etm.create(Payment, {
          orderId,
          status,
          paymentType,
          bankPaymentId,
          qrCode,
          reference,
        })

        await etm.save(payment)
      } catch (error) {
        return [payment, error.message]
      }

      this.logger.info(
        `Done InsertPaymentByBankToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [payment, '']
    }
  }

  InsertPaymentByHappyPointToDbFunc(
    etm: EntityManager,
  ): InsertPaymentByHappyToDbType {
    return async (
      orderId: string,
      happyPointTransactionId: string,
      createOrderParams: CreateOrderDto,
    ): Promise<[Payment, string]> => {
      const start = dayjs()
      const { paymentType } = createOrderParams

      const status = 'toShip'

      let payment: Payment
      try {
        payment = etm.create(Payment, {
          orderId,
          status,
          paymentType,
          happyPointTransactionId,
        })

        await etm.save(payment)
      } catch (error) {
        return [payment, error.message]
      }

      this.logger.info(
        `Done InsertPaymentByHappyPointToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [payment, '']
    }
  }

  InsertPaymentByEwalletToDbFunc(
    etm: EntityManager,
  ): InsertPaymentByEwalletToDbType {
    return async (
      orderId: string,
      walletTransactionId: string,
      createOrderParams: CreateOrderDto,
    ): Promise<[Payment, string]> => {
      const start = dayjs()
      const { paymentType } = createOrderParams

      const status = 'toShip'

      let payment: Payment
      try {
        payment = etm.create(Payment, {
          orderId,
          status,
          paymentType,
          walletTransactionId,
        })

        await etm.save(payment)
      } catch (error) {
        return [payment, error.message]
      }

      this.logger.info(
        `Done InsertPaymentByEwalletToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [payment, '']
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
          orderShop.orderShopAmount,
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
        )(referenceNo, refId, orderShop.orderShopAmount, 'deposit')

        if (insertDepositReferenceError != '') {
          return insertDepositReferenceError
        }

        const [, adjustedWalletSellerError] = await (await adjustWallet)(
          walletShop.id,
          parseFloat(orderShop.orderShopAmount.toString()),
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
        orderShopAmount,
        shopId,
        shopVoucherId,
        note,
        shippingPrice,
        minDeliverDate,
        maxDeliverDate,
      } = params

      const status = 'toPay'

      let orderShop: OrderShop
      try {
        orderShop = etm.create(OrderShop, {
          shippingOptionId,
          orderShopAmount,
          shopId,
          shopVoucherId,
          note,
          shippingPrice,
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
}

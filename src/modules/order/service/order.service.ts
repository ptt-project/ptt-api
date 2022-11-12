import { Injectable } from '@nestjs/common'

import { PinoLogger } from 'nestjs-pino'

import {
  AddressToShippop,
  InquiryPriceFromShippopType,
  InquiryProducProfiletByIdType,
  InquiryProductByIdType,
  InquiryShopByIdType,
  InsertOrderShopProductToDbType,
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
import { AdjustWalletFuncType, InquiryRefIdExistInTransactionType, InquiryWalletByShopIdType, InsertReferenceToDbFuncType, InsertTransactionToDbFuncType, RequestInteranlWalletTransactionServiceFuncType, UpdateReferenceToDbFuncType } from 'src/modules/wallet/type/wallet.type'
import { GetCacheLookupToRedisType } from 'src/modules/happy-point/type/lookup.type'
import { InsertHappyPointToDbParams, InsertHappyPointTypeBuyToDbType, UpdateBalanceToDbParams, UpdateCreditBalanceToDbType, ValidateCalculateAmountType, ValidateCalculateFeeAmountType, ValidateCalculatePointByExchangeAndAmountType } from 'src/modules/happy-point/type/happy-point.type'
import { Wallet } from 'src/db/entities/Wallet'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { Member } from 'src/db/entities/Member'
import { ComplicatedFeeAmount, UnableDuplicateRefId, UnableInquiryRefIdExistTransactions, UnableInserttHappyPointTypeBuyToDb, UnableLookupExchangeRate, UnableToInquiryProductByIdError, UnableToInquiryProductProfileByIdError, UnableToInquiryShopByIdError, UnableToInsertOrder, UnableToInsertOrderShop, UnableToInsertPayment, UnableToUpdatePaymentIdToOrder, UnableToUpdateStockToProductError, UnableToValidateOrder, UnableUpdateDebitBalanceMemberToDb, UpdateWalletWithBuyHappyPoint, WrongCalculateAmount, WrongCalculatePoint } from 'src/utils/response-code'
import { internalSeverError } from 'src/utils/response-error'
import { verifyOtpRequestDto } from 'src/modules/otp/dto/otp.dto'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'
import { InquiryAddressByIdType } from 'src/modules/address/type/member.type'
import { Address } from 'src/db/entities/Address'
import { Order } from 'src/db/entities/Order'
import { Payment } from 'src/db/entities/Payment'
import { Shop } from 'src/db/entities/Shop'
import { OrderShop } from 'src/db/entities/OrderShop'
import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { OrderShopProduct } from 'src/db/entities/OrderShopProduct'
import { CreateOrderDto, OrderShopDto, OrderShopProductDto } from '../dto/createOrder.dto'

@Injectable()
export class OrderService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(OrderService.name)
  }

  CheckoutHandler(
    validateOrderParams: Promise<ValidateOrderParamsType>,
    insertOrderToDb: Promise<InsertOrderToDbType>,
    insertPaymentByBankToDb: Promise<InsertPaymentByBankToDbType>,
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryRefIdExistTransaction: Promise<InquiryRefIdExistInTransactionType>,
    getLookupToRedis: Promise<GetCacheLookupToRedisType>,
    validateFeeAmount: Promise<ValidateCalculateFeeAmountType>,
    validatePoint: Promise<ValidateCalculatePointByExchangeAndAmountType>,
    validateAmount: Promise<ValidateCalculateAmountType>,
    insertHappyPointTypeBuyToDb: Promise<InsertHappyPointTypeBuyToDbType>,
    updateWalletToDb: Promise<RequestInteranlWalletTransactionServiceFuncType>,
    updateDebitBalanceMemberToDb: Promise<UpdateCreditBalanceToDbType>,
    insertTransaction: Promise<InsertTransactionToDbFuncType>,
    insertTransactionReference: Promise<InsertReferenceToDbFuncType>,
    update3rdPartyTransactionReference: Promise<UpdateReferenceToDbFuncType>,
    adjustWallet: Promise<AdjustWalletFuncType>,
    insertPaymentByEwalletToDb: Promise<InsertPaymentByEwalletToDbType>,
    insertPaymentByHappyToDb: Promise<InsertPaymentByHappyToDbType>,
    updatePaymentIdToOrder: Promise<UpdatePaymentIdToOrderType>,
    insertOrderShopToDb: Promise<InsertOrderShopToDbType>,
    inquiryWalletByShopId: Promise<InquiryWalletByShopIdType>,
    inquiryProductById: Promise<InquiryProductByIdType>,
    updateStockToProduct: Promise<UpdateStockToProductType>,
    inquiryProductProfileById: Promise<InquiryProducProfiletByIdType>,
    insertOrderShopProductToDb: Promise<InsertOrderShopProductToDbType>,
  ) {
    return async (
      wallet: Wallet,
      happyPoint: HappyPoint,
      member: Member,
      body: CreateOrderDto,
    ) => {
      const start = dayjs()

      const validateOrderError = await (await validateOrderParams)(body)
      if (validateOrderError != '') {
        return internalSeverError(
          UnableToValidateOrder,
          validateOrderError,
        )
      }

      // validate happyVoucherId

      // create order
      const [order, insertOrderError] = await (await insertOrderToDb)(
        member.id,
        body,
      )
      if (insertOrderError != '') {
        return internalSeverError(UnableToInsertOrder, insertOrderError)
      }
      
      let orderShopList =[]

      // for loop with orderShop size
      for (const x in body.orderShop) {
        const orderShopRequest = body.orderShop[x]

        // validate shopVoucherId

        // create orderShop
        const [orderShop, insertOrderShopError] = await (
          await insertOrderShopToDb
        )(order.id, orderShopRequest)
        if (insertOrderShopError != '') {
          return internalSeverError(
            UnableToInsertOrderShop,
            insertOrderShopError,
          )
        }
        orderShopList.push(orderShop)

        // for loop with orderShopProduct size
        for (const x in orderShopRequest.orderShopProduct) {
          const orderShopProductRequest = orderShopRequest.orderShopProduct[x]

          // get productId
          const [product, inquiryProductByIdError] = await (
            await inquiryProductById
          )(orderShopProductRequest.productId)
          if (inquiryProductByIdError != '') {
            return internalSeverError(
              UnableToInquiryProductByIdError,
              inquiryProductByIdError,
            )
          }

          // update stock in product by productId
          const stock = product.stock - orderShopProductRequest.units
          const sold = 
            orderShopProductRequest.unitPrice * orderShopProductRequest.units + 
            parseFloat((product.sold).toString())
          const amountSold = product.amountSold + orderShopProductRequest.units
          const updateStockToProductError = await (await updateStockToProduct)(
            product.id, 
            stock, 
            sold, 
            amountSold
          )
          if (updateStockToProductError != '') {
            return internalSeverError(
              UnableToUpdateStockToProductError,
              updateStockToProductError,
            )
          }

          // get productProfile by productId
          const [productProfile, inquiryProductProfileByIdError] = await (
            await inquiryProductProfileById
          )(product.productProfileId)
          if (inquiryProductProfileByIdError != '') {
            return internalSeverError(
              UnableToInquiryProductProfileByIdError,
              inquiryProductProfileByIdError,
            )
          }

          // create orderShopProduct
          const [orderShopProduct, insertOrderShopProductError] = await (
            await insertOrderShopProductToDb
          )(orderShop.id, orderShopProductRequest, productProfile)
          if (insertOrderShopProductError != '') {
            return internalSeverError(
              UnableToInsertOrderShop,
              insertOrderShopProductError,
            )
          }
        }
      }

      // create payment
      let paymentOrder
      if (body.paymentType == 'bank') {
        if (body.bankPaymentId && body.qrCode && body.reference) {
          const [payment, insertPaymentError] = await (
            await insertPaymentByBankToDb
          )(order.id, body)
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
        if (happyPoint.balance < body.point) {
          return internalSeverError(UnableToInsertOrder, 'Insufficient funds')
        }

        if (
          body.amountSell &&
          body.point &&
          body.refId &&
          body.totalAmount &&
          body.feeAmount &&
          body.refCode &&
          body.otpCode
        ) {
          const { id: happyPointId } = happyPoint
          const { amountSell, point, refId, totalAmount, feeAmount } = body

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

          const [
            statusErrorInquiryRefIdExistTransaction,
            errorMessageInquiryRefIdExistTransaction,
          ] = await (await inquiryRefIdExistTransaction)(refId)

          if (errorMessageInquiryRefIdExistTransaction != '') {
            if (statusErrorInquiryRefIdExistTransaction === 200) {
              return response(
                undefined,
                UnableDuplicateRefId,
                errorMessageInquiryRefIdExistTransaction,
              )
            } else {
              return internalSeverError(
                UnableInquiryRefIdExistTransactions,
                errorMessageInquiryRefIdExistTransaction,
              )
            }
          }

          const [lookup, isErrorGetLookupToRedis] = await (
            await getLookupToRedis
          )(refId)
          if (isErrorGetLookupToRedis != '') {
            return response(
              undefined,
              UnableLookupExchangeRate,
              isErrorGetLookupToRedis,
            )
          }
          const { happyPointSellRate, happyPointFeePercent } = lookup

          const isErrorValidateFeeAmount = await (await validateFeeAmount)(
            totalAmount,
            happyPointFeePercent,
            feeAmount,
          )
          if (isErrorValidateFeeAmount != '') {
            return response(
              undefined,
              ComplicatedFeeAmount,
              isErrorValidateFeeAmount,
            )
          }

          const iseErrorValidatePoint = await (await validatePoint)(
            totalAmount,
            happyPointSellRate,
            point,
          )
          if (iseErrorValidatePoint != '') {
            return response(
              undefined,
              WrongCalculatePoint,
              iseErrorValidatePoint,
            )
          }

          const iseErrorValidateAmount = await (await validateAmount)(
            totalAmount,
            feeAmount,
            amountSell,
          )
          if (iseErrorValidateAmount != '') {
            return response(
              undefined,
              WrongCalculateAmount,
              iseErrorValidateAmount,
            )
          }

          const parmasInsertHappyTransaction: InsertHappyPointToDbParams = {
            refId,
            amount: amountSell,
            point,
            fee: happyPointFeePercent,
            exchangeRate: happyPointSellRate,
            fromHappyPointId: happyPointId,
            totalAmount: amountSell,
            type: 'SELL',
            note: 'DEBIT',
            status: 'SUCCESS',
          }
          const [happyPointTransaction, isErrorInsertHappyTransaction] = await (
            await insertHappyPointTypeBuyToDb
          )(parmasInsertHappyTransaction)

          if (isErrorInsertHappyTransaction != '') {
            return response(
              undefined,
              UnableInserttHappyPointTypeBuyToDb,
              isErrorInsertHappyTransaction,
            )
          }

          const parmasUpdateCreditMember: UpdateBalanceToDbParams = {
            happyPoint,
            point,
          }

          const [walletTransaction, requestSellHappyPointError] = await (
            await updateWalletToDb
          )(
            wallet.id,
            amountSell,
            'sell_happy_point',
            refId,
            `Sell HappyPoint ${point} point.`,
          )
          if (requestSellHappyPointError != '') {
            return response(
              undefined,
              UpdateWalletWithBuyHappyPoint,
              requestSellHappyPointError,
            )
          }
          console.log('walletTransaction : ', walletTransaction)

          const [
            updateBalaceMember,
            isErrorUpdateDebitBalanceMemberToDb,
          ] = await (await updateDebitBalanceMemberToDb)(
            parmasUpdateCreditMember,
          )

          if (isErrorUpdateDebitBalanceMemberToDb != '') {
            return response(
              undefined,
              UnableUpdateDebitBalanceMemberToDb,
              isErrorUpdateDebitBalanceMemberToDb,
            )
          }

          const [payment, insertPaymentError] = await (
            await insertPaymentByHappyToDb
          )(order.id, happyPointTransaction.id, body)
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
        if (wallet.balance < body.amountSell) {
          return internalSeverError(UnableToInsertOrder, 'Insufficient funds')
        }

        if (body.amountSell && body.refId) {
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

          const [reference, insertDepositReferenceError] = await (
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

          const [adjustedWallet, adjustWalletError] = await (
            await adjustWallet
          )(params.walletId, params.amount, 'buy')

          if (adjustWalletError != '') {
            return [undefined, adjustWalletError]
          }

          const [payment, insertPaymentError] = await (
            await insertPaymentByEwalletToDb
          )(order.id, walletTransaction.id, body)
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

      // update paymentId to order
      const updatePaymentIdToOrderError = await (await updatePaymentIdToOrder)(
        order.id,
        paymentOrder.id,
      )
      if (updatePaymentIdToOrderError != '') {
        return internalSeverError(
          UnableToUpdatePaymentIdToOrder,
          updatePaymentIdToOrderError,
        )
      }

      for (const x in orderShopList) {
        const orderShop = orderShopList[x]

        const [walletShop, inquiryWalletByShopIdError] = await (await inquiryWalletByShopId)(
          orderShop.shopId,
        )

        if (inquiryWalletByShopIdError != '') {
          return [undefined, inquiryWalletByShopIdError]
        }

        const [walletTransaction, insertTransactionError] = await (
          await insertTransaction
        )(walletShop.id, orderShop.orderShopAmount, 0, 'deposit', 'deposit', undefined, orderShop.id)
  
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
        )(referenceNo, body.refId, orderShop.orderShopAmount, 'deposit')
  
        if (insertDepositReferenceError != '') {
          return [undefined, insertDepositReferenceError]
        }

        const [, adjustedWalletSellerError] = await (await adjustWallet)(
          walletShop.id,
          parseFloat((orderShop.orderShopAmount).toString()),
          'deposit',
        )

        if (adjustedWalletSellerError != '') {
          return [undefined, adjustedWalletSellerError]
        }
      }

      this.logger.info(
        `Done CheckoutHandler ${dayjs().diff(start)} ms`,
      )
      return response(undefined)
    }
  }

  async ValidateOrderParamsFunc(
    etm: EntityManager
  ): Promise<ValidateOrderParamsType> {
    return async (
      params: CreateOrderDto,
    ): Promise<string> => {
      const start = dayjs()

      let countPriceShop = 0
      let countShippingPriceShop = 0  
      for(const x in params.orderShop){
        const orderShopRequest = params.orderShop[x]

        let countPriceProduct = 0

        // validate shop
        let shop: Shop
        const shopId = orderShopRequest.shopId
        try {
          shop = await etm.findOne(Shop, shopId, { withDeleted: false })
        } catch (error) {
          return error.message
        }

        if (!shop) {
          return 'Not found shop'
        }

        for(const x in orderShopRequest.orderShopProduct){
          const orderShopProductRequest = orderShopRequest.orderShopProduct[x]


          // validate productId
          let product: Product
          const productId = orderShopProductRequest.productId
          try {
            product = await etm.findOne(Product, productId, { withDeleted: false })
          } catch (error) {
            return error.message
          }

          if (!product) {
            return 'Not found product'
          }

          countPriceProduct += (orderShopProductRequest.units * orderShopProductRequest.unitPrice)
        }

        if(orderShopRequest.orderShopAmount != countPriceProduct){
          return 'Validate order false because orderShopAmount is incorrect'
        }

        countPriceShop += orderShopRequest.orderShopAmount
        countShippingPriceShop += orderShopRequest.shippingPrice
      }

      if((params.merchandiseSubtotal != countPriceShop) || (params.shippingTotal != countShippingPriceShop)){
        return 'Validate order false because merchandiseSubtotal or shippingTotal are incorrect'
      }
      
      this.logger.info(
        `Done ValidateOrderParamsFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  async InquiryAddressByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryAddressByIdType> {
    return async (addressId: string): Promise<[Address, string]> => {
      let address: Address
      try {
        address = await etm.findOne(Address, addressId, { withDeleted: false })
      } catch (error) {
        return [address, error.message]
      }

      if (!address) {
        return [address, 'Not found Address']
      }

      return [address, '']
    }
  }

  async InsertOrderToDbFunc(etm: EntityManager): Promise<InsertOrderToDbType> {
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

  async InsertPaymentByBankToDbFunc(
    etm: EntityManager,
  ): Promise<InsertPaymentByBankToDbType> {
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

      this.logger.info(`Done InsertPaymentToDbFunc ${dayjs().diff(start)} ms`)
      return [payment, '']
    }
  }

  async InsertPaymentByHappyPointToDbFunc(
    etm: EntityManager,
  ): Promise<InsertPaymentByHappyToDbType> {
    return async (
      orderId: string,
      happyPointTransactionId: string,
      createOrderParams: CreateOrderDto,
    ): Promise<[Payment, string]> => {
      const start = dayjs()
      const { paymentType } = createOrderParams

      const status = 'toPay'

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

  async InsertPaymentByEwalletToDbFunc(
    etm: EntityManager,
  ): Promise<InsertPaymentByEwalletToDbType> {
    return async (
      orderId: string,
      walletTransactionId: string,
      createOrderParams: CreateOrderDto,
    ): Promise<[Payment, string]> => {
      const start = dayjs()
      const { paymentType } = createOrderParams

      const status = 'toPay'

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

  async UpdatePaymentIdToOrderFunc(
    etm: EntityManager,
  ): Promise<UpdatePaymentIdToOrderType> {
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

  async InsertOrderShopToDbFunc(
    etm: EntityManager,
  ): Promise<InsertOrderShopToDbType> {
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

  async InquiryProductByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductByIdType> {
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

  async InquiryProductProfileByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProducProfiletByIdType> {
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

  async InsertOrderShopProductToDbFunc(
    etm: EntityManager,
  ): Promise<InsertOrderShopProductToDbType> {
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

  async UpdateStockToProductFunc(
    etm: EntityManager,
  ): Promise<UpdateStockToProductType> {
    return async (
      productId: string,
      stock: number,
      sold: number,
      amountSold: number
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Product, productId, { stock, sold, amountSold})
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

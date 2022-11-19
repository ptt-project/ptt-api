import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { EntityManager } from 'typeorm'
import { Shop } from 'src/db/entities/Shop'

import dayjs from 'dayjs'
import {
  InsertPaymentByBankToDbType,
  InsertPaymentByEwalletToDbType,
  InsertPaymentByHappyToDbType,
} from '../type/order.type'
import { Payment } from 'src/db/entities/Payment'
import { CreateOrderDto } from '../dto/createOrder.dto'

@Injectable()
export class PaymentService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(PaymentService.name)
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
}

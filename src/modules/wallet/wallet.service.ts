import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Between, EntityManager, SelectQueryBuilder } from 'typeorm'

import {
  UnableToAdjustWallet,
  UnableToGetWalletTransaction, UnableToInsertDepositReference, UnableToInsertTransaction, UnableToRequestDepositQrCode,
} from 'src/utils/response-code'

import {
  AdjustWalletFuncType,
  InqueryWalletTransactionFuncType, InsertDepositReferenceToDbFuncType, InsertTransactionToDbFuncType, InsertWalletToDbFuncType, RequestDepositQrCodeFuncType,
} from './wallet.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { Wallet } from 'src/db/entities/Wallet'
import { TransactionType, WalletTransaction } from 'src/db/entities/WalletTransaction'
import { getWalletTransactionQueryDTO, RequestDepositQrCodeRequestDTO } from './dto/wallet.dto'

import { paginate } from 'nestjs-typeorm-paginate'
import { WalletTransactionReference } from 'src/db/entities/WalletTransactionReference'
import { randomUUID } from 'crypto'
import { type } from 'os'

@Injectable()
export class WalletService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(WalletService.name)
  }

  GetWalletHandler() {
    return async (wallet: Wallet) => {
      const start = dayjs()

      this.logger.info(`Done getWalletHandler ${dayjs().diff(start)} ms`)
      return response(wallet)
    }
  }

  GetWalletTransactionHandler(
    getWalletTransaction: Promise<InqueryWalletTransactionFuncType>,
  ) {
    return async (wallet: Wallet, query: getWalletTransactionQueryDTO) => {
      const start = dayjs()
      const { id: walletId } = wallet
      const { startDate, endDate, type, limit = 10, page = 1 } = query

      const [walletTransactions, getWalletTransactionError] = await (await getWalletTransaction)(
        walletId,
        startDate,
        endDate,
        type,
      )

      if (getWalletTransactionError != '') {
        return response(undefined, UnableToGetWalletTransaction, getWalletTransactionError)
      }

      const result = await paginate<WalletTransaction>(walletTransactions, { limit, page })

      this.logger.info(
        `Done getWalletTransactionHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  RequestDepositQrCodeHandler(
    insertTransaction: Promise<InsertTransactionToDbFuncType>,
    insertDepositReference: Promise<InsertDepositReferenceToDbFuncType>,
    requestDepositQrCode: Promise<RequestDepositQrCodeFuncType>,
    adjustWallet: Promise<AdjustWalletFuncType>,
  ) {
    return async (wallet: Wallet, body: RequestDepositQrCodeRequestDTO) => {
      const start = dayjs()
      const { id: walletId } = wallet
      const { amount } = body
      const detail = `QrCode deposit ${amount} baht`

      const [walletTransaction, insertTransactionError] = await (await insertTransaction)(
        walletId, 
        amount,
        detail,
        'deposit',
      )

      if (insertTransactionError != '') {
        return response(undefined, UnableToInsertTransaction, insertTransactionError)
      }

      const [referenceNo, insertDepositReferenceError] = await (await insertDepositReference)(walletTransaction)

      if (insertDepositReferenceError != '') {
        return response(undefined, UnableToInsertDepositReference, insertDepositReferenceError)
      }

      const [qrCode, requestDepositQrCodeError] = await (await requestDepositQrCode)(
        amount,
        referenceNo,
        detail,
      )

      if (requestDepositQrCodeError != '') {
        return response(undefined, UnableToRequestDepositQrCode, requestDepositQrCodeError)
      }

      const [adjestedWallet, adjustWalletError] = await (await adjustWallet)(
        walletId,
        amount,
      ) // Todo: mockup before connect to payment api

      if (adjustWalletError != '') {
        return response(undefined, UnableToAdjustWallet, adjustWalletError)
      }

      this.logger.info(
        `Done RequestDepositQrCodeHandler ${dayjs().diff(start)} ms`,
      )
      return response(qrCode)
    }
  }

  async InsertWalletToDbFunc(etm: EntityManager): Promise<InsertWalletToDbFuncType> {
    return async (
      memberId: number,
    ): Promise<[Wallet, string]> => {
      const start = dayjs()
      let wallet: Wallet

      try {
        wallet = etm.create(Wallet, { memberId })
        wallet = await etm.save(wallet)
        
      } catch (error) {
        return [wallet, error]
      }

      this.logger.info(`Done InsertWalletToDbFunc ${dayjs().diff(start)} ms`)
      return [wallet, '']
    }
  }

  async InqueryWalletTransactionFromDbFunc(etm: EntityManager): Promise<InqueryWalletTransactionFuncType> {
    return async (
      walletId: number,
      startDate?: Date,
      endDate?: Date,
      type?: TransactionType
    ): Promise<[SelectQueryBuilder<WalletTransaction>, string]> => {
      const start = dayjs()
      let walletTransactions: SelectQueryBuilder<WalletTransaction>

      try {
        walletTransactions = etm.createQueryBuilder(WalletTransaction, 'transactions')
        const condition: any = { walletId, deletedAt: null }
        if (startDate && endDate) {
          condition.createdAt = Between(startDate, endDate)
        }
        if (type) {
          condition.type = type
        }
        walletTransactions.where(condition)
        
      } catch (error) {
        return [walletTransactions, error]
      }

      this.logger.info(`Done InqueryWalletTransactionFromDbFunc ${dayjs().diff(start)} ms`)
      return [walletTransactions, '']
    }
  }

  async AdjustWalletInDbFunc(etm: EntityManager): Promise<AdjustWalletFuncType> {
    return async (
      walletId: number,
      adjustBalance: number,
    ): Promise<[Wallet, string]> => {
      const start = dayjs()
      let wallet: Wallet
      try {
        wallet = await etm.findOne(Wallet, walletId)
        
        if (!wallet) {
          return [null, 'Unable to find wallet']
        }

        if (adjustBalance < 0 && wallet.balance + adjustBalance < 0) {
          return [wallet, 'your wallet balance is not enough']
        }

        wallet.balance += adjustBalance

        await etm.save(wallet)

      } catch (error) {
        return [wallet, error]
      }

      this.logger.info(`Done AdjustWalletInDbFunc ${dayjs().diff(start)} ms`)
      return [wallet, '']
    }
  }

  async InsertTransactionToDbFunc(etm: EntityManager): Promise<InsertTransactionToDbFuncType> {
    return async (
      walletId: number,
      amount: number,
      detail: string,
      type: TransactionType,
    ): Promise<[WalletTransaction, string]> => {
      const start = dayjs()
      let walletTransaction: WalletTransaction

      try {
        walletTransaction = etm.create(WalletTransaction, {
          walletId,
          type,
          amount,
          detail,
          status: 'success', // Todo: mockup before connect to payment api
        })
        walletTransaction = await etm.save(walletTransaction)
        
      } catch (error) {
        return [walletTransaction, error]
      }

      this.logger.info(`Done InsertTransactionToDbFunc ${dayjs().diff(start)} ms`)
      return [walletTransaction, '']
    }
  }

  async InsertDepositReferenceToDbFunc(etm: EntityManager): Promise<InsertDepositReferenceToDbFuncType> {
    return async (
      walletTransaction: WalletTransaction,
    ): Promise<[string, string]> => {
      const start = dayjs()
      let walletTransactionReference: WalletTransactionReference
      let referenceNo: string

      try {
        let alreadyUsedRef: WalletTransactionReference
        do {
          referenceNo = randomUUID()
          alreadyUsedRef = await etm.findOne(WalletTransactionReference, { where: { referenceNo } })
        } while (alreadyUsedRef)

        walletTransactionReference = etm.create(WalletTransactionReference, { transactionId: walletTransaction.id, referenceNo})
        walletTransactionReference = await etm.save(walletTransactionReference)
        walletTransaction.referenceId = walletTransactionReference.id
        await etm.save(walletTransaction)
        
      } catch (error) {
        return [referenceNo, error]
      }

      this.logger.info(`Done InsertDepositReferenceToDbFunc ${dayjs().diff(start)} ms`)
      return [referenceNo, '']
    }
  }

  async RequestDepositQrCodeFunc(etm: EntityManager): Promise<RequestDepositQrCodeFuncType> {
    return async (
      amount: number,
      referenceNo: string,
      detail: string,
    ): Promise<[string, string]> => {
      const start = dayjs()

      // Todo: Request qr code form payment api provider.
      const qrCode = randomUUID()

      this.logger.info(`Done RequestDepositQrCodeFunc ${dayjs().diff(start)} ms`)
      return [qrCode, '']
    }
  }
}

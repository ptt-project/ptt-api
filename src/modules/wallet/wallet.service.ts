import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Between, EntityManager, SelectQueryBuilder } from 'typeorm'

import {
  UnableToGetWalletTransaction,
} from 'src/utils/response-code'

import {
  AdjustWalletFuncType,
  InqueryWalletTransactionFuncType, InsertWalletToDbFuncType,
} from './wallet.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { Wallet } from 'src/db/entities/Wallet'
import { TransactionType, WalletTransaction } from 'src/db/entities/WalletTransaction'
import { getWalletTransactionQueryDTO } from './dto/wallet.dto'

import { paginate } from 'nestjs-typeorm-paginate'

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
}

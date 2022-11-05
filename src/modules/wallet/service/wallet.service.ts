import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Between, EntityManager, SelectQueryBuilder } from 'typeorm'

import {
  UnableToAdjustWallet,
  UnableToGetWalletTransaction,
  UnableToInqueryFeeRate,
  UnableToInsertReference,
  UnableToInsertTransaction,
  UnableToInsertWithdrawReference,
  UnableToRequestDepositQrCode,
  UnableToRequestWithdraw,
  UnableToUpdateReference,
  UnableToInqueryBankAccount,
} from 'src/utils/response-code'

import {
  AdjustWalletFuncType,
  InqueryWalletTransactionFuncType,
  RequestInteranlWalletTransactionServiceFuncType,
  UpdateReferenceToDbFuncType,
  InsertReferenceToDbFuncType,
  InsertTransactionToDbFuncType,
  InsertWalletToDbFuncType,
  RequestDepositQrCodeFuncType,
  RequestWithdrawFuncType,
} from '../type/wallet.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { Wallet } from 'src/db/entities/Wallet'

import {
  TransactionNote,
  TransactionType,
  WalletTransaction,
} from 'src/db/entities/WalletTransaction'
import {
  getWalletTransactionQueryDTO,
  RequestDepositQrCodeRequestDTO,
  WithdrawRequestDTO,
} from '../dto/wallet.dto'

import { paginate } from 'nestjs-typeorm-paginate'
import { WalletTransactionReference } from 'src/db/entities/WalletTransactionReference'
import { randomUUID } from 'crypto'
import { InquiryVerifyOtpType } from '../../otp/type/otp.type'
import { verifyOtpRequestDto } from '../../otp/dto/otp.dto'
import { Member } from 'src/db/entities/Member'
import { InqueryBankAccountFormDbFuncType } from '../../bankAccount/type/bankAccount.type'
import { InquiryMasterConfigType } from 'src/modules/master-config/type/master-config.type'

@Injectable()
export class WalletService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(WalletService.name)
  }

  async RequestInteranlWalletTransactionService(
    insertTransaction: Promise<InsertTransactionToDbFuncType>,
    insertTransactionReference: Promise<InsertReferenceToDbFuncType>,
    update3rdPartyTransactionReference: Promise<UpdateReferenceToDbFuncType>,
    adjustWallet: Promise<AdjustWalletFuncType>,
  ): Promise<RequestInteranlWalletTransactionServiceFuncType> {
    return async (
      walletId: string,
      amount: number,
      type: TransactionType,
      thirdPtReferenceNo: string,
      detail: string,
      orderShopId?: string,
    ) => {
      const start = dayjs()

      const [walletTransaction, insertTransactionError] = await (
        await insertTransaction
      )(walletId, amount, 0, detail, type, undefined, orderShopId)

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
      )(referenceNo, thirdPtReferenceNo, amount, detail)

      if (insertDepositReferenceError != '') {
        return [undefined, insertDepositReferenceError]
      }

      const [adjustedWallet, adjustWalletError] = await (await adjustWallet)(
        walletId,
        amount,
        type,
      )

      if (adjustWalletError != '') {
        return [undefined, adjustWalletError]
      }

      this.logger.info(
        `Done RequestInteranlWalletTransactionService ${dayjs().diff(
          start,
        )} ms`,
      )
      return [adjustedWallet, '']
    }
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

      const [walletTransactions, getWalletTransactionError] = await (
        await getWalletTransaction
      )(walletId, startDate, endDate, type)

      if (getWalletTransactionError != '') {
        return response(
          undefined,
          UnableToGetWalletTransaction,
          getWalletTransactionError,
        )
      }

      const result = await paginate<WalletTransaction>(walletTransactions, {
        limit,
        page,
      })

      this.logger.info(
        `Done getWalletTransactionHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  RequestDepositQrCodeHandler(
    insertTransaction: Promise<InsertTransactionToDbFuncType>,
    insertDepositReference: Promise<InsertReferenceToDbFuncType>,
    requestDepositQrCode: Promise<RequestDepositQrCodeFuncType>,
    adjustWallet: Promise<AdjustWalletFuncType>,
  ) {
    return async (wallet: Wallet, body: RequestDepositQrCodeRequestDTO) => {
      const start = dayjs()
      const { id: walletId } = wallet
      const { amount } = body
      const detail = `QrCode deposit ${amount} baht`

      const [walletTransaction, insertTransactionError] = await (
        await insertTransaction
      )(walletId, amount, 0, detail, 'deposit')

      if (insertTransactionError != '') {
        return response(
          undefined,
          UnableToInsertTransaction,
          insertTransactionError,
        )
      }

      const [referenceNo, insertDepositReferenceError] = await (
        await insertDepositReference
      )(walletTransaction)

      if (insertDepositReferenceError != '') {
        return response(
          undefined,
          UnableToInsertReference,
          insertDepositReferenceError,
        )
      }

      const [qrCode, requestDepositQrCodeError] = await (
        await requestDepositQrCode
      )(amount, referenceNo, detail)

      if (requestDepositQrCodeError != '') {
        return response(
          undefined,
          UnableToRequestDepositQrCode,
          requestDepositQrCodeError,
        )
      }

      const [adjestedWallet, adjustWalletError] = await (await adjustWallet)(
        walletId,
        amount,
        'deposit',
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

  WithdrawHandler(
    verifyOtp: Promise<InquiryVerifyOtpType>,
    inqueryBankAccount: Promise<InqueryBankAccountFormDbFuncType>,
    inqueryMasterConfig: Promise<InquiryMasterConfigType>,
    insertTransaction: Promise<InsertTransactionToDbFuncType>,
    insertWithdrawReference: Promise<InsertReferenceToDbFuncType>,
    requestWithdraw: Promise<RequestWithdrawFuncType>,
    adjustWallet: Promise<AdjustWalletFuncType>,
  ) {
    return async (member: Member, wallet: Wallet, body: WithdrawRequestDTO) => {
      const start = dayjs()
      const { id: walletId } = wallet
      const { amount, bankAccountId } = body

      const verifyOtpData: verifyOtpRequestDto = {
        reference: member.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await verifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const [bankAccount, inqueryBankAccountError] = await (
        await inqueryBankAccount
      )(member.id, bankAccountId)

      if (inqueryBankAccountError != '') {
        return response(
          undefined,
          UnableToInqueryBankAccount,
          inqueryBankAccountError,
        )
      }

      const [masterConfig, inqueryMasterConfigtError] = await (
        await inqueryMasterConfig
      )()

      if (inqueryMasterConfigtError != '') {
        return response(undefined, UnableToInqueryFeeRate, inqueryMasterConfigtError)
      }

      const {eWalletWithdrawFeeRate: feeRate} = masterConfig.config

      const fee = amount * feeRate
      const newAmount = amount - fee

      const detail = `Withdraw ${amount} baht fee ${fee} baht with ${
        bankAccount.bankCode
      } **${bankAccount.accountNumber.slice(
        bankAccount.accountNumber.length - 4,
        bankAccount.accountNumber.length,
      )}`

      const [walletTransaction, insertTransactionError] = await (
        await insertTransaction
      )(walletId, amount, feeRate, detail, 'withdraw', bankAccountId)

      if (insertTransactionError != '') {
        return response(
          undefined,
          UnableToInsertTransaction,
          insertTransactionError,
        )
      }

      const [referenceNo, insertWithdrawReferenceError] = await (
        await insertWithdrawReference
      )(walletTransaction)

      if (insertWithdrawReferenceError != '') {
        return response(
          undefined,
          UnableToInsertWithdrawReference,
          insertWithdrawReferenceError,
        )
      }

      const [qrCode, requestWithdrawQrCodeError] = await (
        await requestWithdraw
      )(newAmount, referenceNo, detail)

      if (requestWithdrawQrCodeError != '') {
        return response(
          undefined,
          UnableToRequestWithdraw,
          requestWithdrawQrCodeError,
        )
      }
      
      const [adjestedWallet, adjustWalletError] = await (await adjustWallet)(
        walletId,
        amount,
        'withdraw',
      ) // Todo: mockup before connect to payment api

      if (adjustWalletError != '') {
        return response(undefined, UnableToAdjustWallet, adjustWalletError)
      }

      this.logger.info(`Done WithdrawHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InsertWalletToDbFunc(
    etm: EntityManager,
  ): Promise<InsertWalletToDbFuncType> {
    return async (memberId: string, shopId?: string): Promise<[Wallet, string]> => {
      const start = dayjs()
      let wallet: Wallet

      try {
        wallet = etm.create(Wallet, { memberId, shopId })
        wallet = await etm.save(wallet)
      } catch (error) {
        return [wallet, error.message]
      }

      this.logger.info(`Done InsertWalletToDbFunc ${dayjs().diff(start)} ms`)
      return [wallet, '']
    }
  }

  async InqueryWalletTransactionFromDbFunc(
    etm: EntityManager,
  ): Promise<InqueryWalletTransactionFuncType> {
    return async (
      walletId: string,
      startDate?: Date,
      endDate?: Date,
      type?: TransactionType,
    ): Promise<[SelectQueryBuilder<WalletTransaction>, string]> => {
      const start = dayjs()
      let walletTransactions: SelectQueryBuilder<WalletTransaction>

      try {
        walletTransactions = etm.createQueryBuilder(
          WalletTransaction,
          'transactions',
        )
        const condition: any = { walletId, deletedAt: null }
        if (startDate && endDate) {
          condition.createdAt = Between(startDate, endDate)
        }
        if (type) {
          condition.type = type
        }
        walletTransactions.where(condition)
      } catch (error) {
        return [walletTransactions, error.message]
      }

      this.logger.info(
        `Done InqueryWalletTransactionFromDbFunc ${dayjs().diff(start)} ms`,
      )
      return [walletTransactions, '']
    }
  }

  async AdjustWalletInDbFunc(
    etm: EntityManager,
  ): Promise<AdjustWalletFuncType> {
    return async (
      walletId: string,
      adjustBalance: number,
      transactionType: TransactionType,
    ): Promise<[Wallet, string]> => {
      const start = dayjs()
      let wallet: Wallet
      try {
        wallet = await etm.findOne(Wallet, walletId)
        const note: TransactionNote =
          transactionType == 'buy' ||
          transactionType == 'buy_happy_point' ||
          transactionType == 'withdraw'
            ? 'debit'
            : 'credit'

        if (!wallet) {
          return [null, 'Unable to find wallet']
        }

        if (note == 'debit' && wallet.balance - adjustBalance < 0) {
          return [wallet, 'your wallet balance is not enough']
        }
        if (note == 'debit') {
          wallet.balance -= adjustBalance
        } else {
          wallet.balance += adjustBalance
        }

        await etm.save(wallet)
      } catch (error) {
        return [wallet, error.message]
      }

      this.logger.info(`Done AdjustWalletInDbFunc ${dayjs().diff(start)} ms`)
      return [wallet, '']
    }
  }

  async InsertTransactionToDbFunc(
    etm: EntityManager,
  ): Promise<InsertTransactionToDbFuncType> {
    return async (
      walletId: string,
      amount: number,
      feeRate: number,
      detail: string,
      type: TransactionType,
      bankAccountId?: string,
      orderShopId?: string,
    ): Promise<[WalletTransaction, string]> => {
      const start = dayjs()
      let walletTransaction: WalletTransaction

      const fee = amount * feeRate
      const newAmount = amount - fee
      const total = amount
      
      try {
        walletTransaction = etm.create(WalletTransaction, {
          walletId,
          type,
          amount: newAmount,
          fee,
          feeRate,
          total,
          detail,
          bankAccountId,
          orderShopId,
          note:
            type == 'buy' || type == 'buy_happy_point' || type == 'withdraw'
              ? 'debit'
              : 'credit',
          status: type == 'deposit' ? 'success' : 'pending', // Todo: mockup before connect to payment api
        })
        walletTransaction = await etm.save(walletTransaction)
      } catch (error) {
        return [walletTransaction, error.message]
      }

      this.logger.info(
        `Done InsertTransactionToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [walletTransaction, '']
    }
  }

  async InsertReferenceToDbFunc(
    etm: EntityManager,
  ): Promise<InsertReferenceToDbFuncType> {
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
          alreadyUsedRef = await etm.findOne(WalletTransactionReference, {
            where: { referenceNo },
          })
        } while (alreadyUsedRef)

        walletTransactionReference = etm.create(WalletTransactionReference, {
          transactionId: walletTransaction.id,
          referenceNo,
        })
        walletTransactionReference = await etm.save(walletTransactionReference)
        walletTransaction.referenceId = walletTransactionReference.id
        await etm.save(walletTransaction)
      } catch (error) {
        return [referenceNo, error.message]
      }

      this.logger.info(
        `Done InsertDepositReferenceToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [referenceNo, '']
    }
  }

  async InsertWithdrawReferenceToDbFunc(
    etm: EntityManager,
  ): Promise<InsertReferenceToDbFuncType> {
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
          alreadyUsedRef = await etm.findOne(WalletTransactionReference, {
            where: { referenceNo },
          })
        } while (alreadyUsedRef)

        walletTransactionReference = etm.create(WalletTransactionReference, {
          transactionId: walletTransaction.id,
          referenceNo,
        })
        walletTransactionReference = await etm.save(walletTransactionReference)
        walletTransaction.referenceId = walletTransactionReference.id
        await etm.save(walletTransaction)
      } catch (error) {
        return [referenceNo, error.message]
      }

      this.logger.info(
        `Done InsertWithdrawReferenceToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [referenceNo, '']
    }
  }

  async RequestDepositQrCodeFunc(
    etm: EntityManager,
  ): Promise<RequestDepositQrCodeFuncType> {
    return async (
      amount: number,
      referenceNo: string,
      detail: string,
    ): Promise<[string, string]> => {
      const start = dayjs()

      // Todo: Request qr code form payment api provider.
      const qrCode = randomUUID()

      this.logger.info(
        `Done RequestDepositQrCodeFunc ${dayjs().diff(start)} ms`,
      )
      return [qrCode, '']
    }
  }

  async RequestWithdrawFunc(
    etm: EntityManager,
  ): Promise<RequestDepositQrCodeFuncType> {
    return async (
      amount: number,
      referenceNo: string,
      detail: string,
    ): Promise<[string, string]> => {
      const start = dayjs()

      // Todo: Request waithdraw form payment api provider.
      const ref = randomUUID()

      this.logger.info(`Done RequestWithdrawFunc ${dayjs().diff(start)} ms`)
      return [ref, '']
    }
  }

  async UpdateReferenceToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateReferenceToDbFuncType> {
    return async (
      referenceNo: string,
      thirdPtReferenceNo: string,
      amount: number,
      detail: string,
    ): Promise<[WalletTransactionReference, string]> => {
      const start = dayjs()

      let walletTransactionReference: WalletTransactionReference

      try {
        walletTransactionReference = await etm.findOne(
          WalletTransactionReference,
          {
            where: { referenceNo, deletedAt: null },
            relations: ['transaction'],
          },
        )

        if (!walletTransactionReference) {
          return [walletTransactionReference, 'Transaction reference not found']
        }

        walletTransactionReference.thirdPtReferenceNo = thirdPtReferenceNo
        walletTransactionReference.amount = amount
        walletTransactionReference.detail = detail
        walletTransactionReference.transaction.status = 'success'

        walletTransactionReference = await etm.save(walletTransactionReference)
        await etm.save(walletTransactionReference.transaction)
      } catch (error) {
        return [walletTransactionReference, error]
      }

      this.logger.info(`Done UpdateReferenceToDbFunc ${dayjs().diff(start)} ms`)
      return [walletTransactionReference, '']
    }
  }
}

import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { HappyPointTransaction } from 'src/db/entities/HappyPointTransaction'
import { Wallet } from 'src/db/entities/Wallet'
import { response } from 'src/utils/response'
import {
  UnableLookupExchangeRate,
  UnableInserttHappyPointTypeBuyToDb,
  WrongCalculatePoint,
  UnableInquiryWalletIdFromUsername,
  UnableFromHappyPointInserttHappyPointTypeBuyToDb,
  UnableToHappyPointInserttHappyPointTypeBuyToDb,
  UnableUpdatHappyPointCreditTransferToDb,
  UnableUpdatHappyPointDebitTransferToDb,
  UnableUpdateCreditBalanceMemberToDb,
  UnableTransferToMySelf,
  UpdateWalletWithBuyHappyPoint,
  WrongCalculateAmount,
  ComplicatedFeePoint,
  ComplicatedFeeAmount,
  UnableUpdateDebitBalanceMemberToDb,
  UnableInquiryRefIdExistTransactions,
  UnableDuplicateRefId,
  OverLimitTransferPerday,
  UnableInquiryMasterConfig,
  UnableUpdateResetLimitTransfer,
  UnableUpdateDebitLimitTransferToDb,
} from 'src/utils/response-code'
import { internalSeverError } from 'src/utils/response-error'
import { EntityManager } from 'typeorm'
import { verifyOtpRequestDto } from '../../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../../otp/type/otp.type'
import { RequestInteranlWalletTransactionServiceFuncType } from '../../wallet/type/wallet.type'
import {
  BuyHappyPointRequestDto,
  SellHappyPointRequestDto,
  TransferHappyPointDto,
} from '../dto/happy-point.dto'
import {
  InsertHappyPointTypeBuyToDbType,
  InsertHappyPointToDbParams,
  UpdateCreditBalanceToDbType,
  UpdateBalanceToDbParams,
  UpdateDebitBalanceToDbType,
  ValidateCalculatePointByExchangeAndAmountType,
  InsertHappyPointToDbType,
  InquiryHappyPointFromUsernameType,
  ValidateCalculatePointByTotalPointAndFeeType,
  ValidateCalculateAmountType,
  ValidateCalculateFeeAmountType,
  ValidateCalculateFeePointType,
  InquiryRefIdExistInTransactionType,
  ValidateLimitTransferType,
  UpdateResetLimitTransferType,
  UpdateDebitLimitTransferToDbType,
  UpdateCreditLimitTransferToDbType,
} from '../type/happy-point.type'
import { RedisService } from 'nestjs-redis'
import { GetCacheLookupToRedisType } from '../type/lookup.type'
import { InquiryMasterConfigType } from 'src/modules/master-config/type/master-config.type'
import { Member } from 'src/db/entities/Member'

@Injectable()
export class HappyPointService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext(HappyPointService.name)
  }

  BuyHappyPointHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryRefIdExistTransaction: Promise<InquiryRefIdExistInTransactionType>,
    getLookupToRedis: Promise<GetCacheLookupToRedisType>,
    validatePoint: Promise<ValidateCalculatePointByExchangeAndAmountType>,
    insertHappyPointTypeBuyToDb: Promise<InsertHappyPointTypeBuyToDbType>,
    updateWalletToDb: Promise<RequestInteranlWalletTransactionServiceFuncType>,
    updateCreditBalanceMemberToDb: Promise<UpdateCreditBalanceToDbType>,
  ) {
    return async (
      wallet: Wallet,
      happyPoint: HappyPoint,
      member: Member,
      body: BuyHappyPointRequestDto,
    ) => {
      const start = dayjs()
      const { id: happyPointId } = happyPoint
      const { amount, point, refId } = body

      const verifyOtpData: verifyOtpRequestDto = {
        reference: member.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
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

      const [lookup, isErrorGetLookupToRedis] = await (await getLookupToRedis)(
        refId,
      )
      if (isErrorGetLookupToRedis != '') {
        return response(
          undefined,
          UnableLookupExchangeRate,
          isErrorGetLookupToRedis,
        )
      }

      const { happyPointBuyRate } = lookup
      const iseErrorValidatePoint = await (await validatePoint)(
        amount,
        happyPointBuyRate,
        point,
      )

      if (iseErrorValidatePoint != '') {
        return response(undefined, WrongCalculatePoint, iseErrorValidatePoint)
      }

      const parmasInsertHappyTransaction: InsertHappyPointToDbParams = {
        refId,
        amount,
        point,
        exchangeRate: happyPointBuyRate,
        fromHappyPointId: happyPointId,
        totalAmount: amount,
        type: 'BUY',
        note: 'CREDIT',
        status: 'SUCCESS',
      }
      const [, isErrorInsertHappyTransaction] = await (
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

      const [, requestBuyHappyPointError] = await (await updateWalletToDb)(
        wallet.id,
        amount,
        'buy_happy_point',
        refId,
        `Buy HappyPoint ${point} point.`,
      )
      if (requestBuyHappyPointError != '') {
        return response(
          undefined,
          UpdateWalletWithBuyHappyPoint,
          requestBuyHappyPointError,
        )
      }

      const [updateBalaceMember, isErrorUpdateCreditBalanceMemberToDb] = await (
        await updateCreditBalanceMemberToDb
      )(parmasUpdateCreditMember)

      if (isErrorUpdateCreditBalanceMemberToDb != '') {
        return response(
          undefined,
          UnableUpdateCreditBalanceMemberToDb,
          isErrorUpdateCreditBalanceMemberToDb,
        )
      }

      this.logger.info(`Done BuyHappyPointHandler ${dayjs().diff(start)} ms`)
      return response(updateBalaceMember)
    }
  }

  SellHappyPointHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryRefIdExistTransaction: Promise<InquiryRefIdExistInTransactionType>,
    getLookupToRedis: Promise<GetCacheLookupToRedisType>,
    validateFeeAmount: Promise<ValidateCalculateFeeAmountType>,
    validatePoint: Promise<ValidateCalculatePointByExchangeAndAmountType>,
    validateAmount: Promise<ValidateCalculateAmountType>,
    insertHappyPointTypeBuyToDb: Promise<InsertHappyPointTypeBuyToDbType>,
    updateWalletToDb: Promise<RequestInteranlWalletTransactionServiceFuncType>,
    updateDebitBalanceMemberToDb: Promise<UpdateCreditBalanceToDbType>,
  ) {
    return async (
      wallet: Wallet,
      happyPoint: HappyPoint,
      member: Member,
      body: SellHappyPointRequestDto,
    ) => {
      const start = dayjs()
      const { id: happyPointId } = happyPoint
      const { amount, point, refId, totalAmount, feeAmount } = body

      const verifyOtpData: verifyOtpRequestDto = {
        reference: member.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
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

      const [lookup, isErrorGetLookupToRedis] = await (await getLookupToRedis)(
        refId,
      )
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
        return response(undefined, WrongCalculatePoint, iseErrorValidatePoint)
      }

      const iseErrorValidateAmount = await (await validateAmount)(
        totalAmount,
        feeAmount,
        amount,
      )
      if (iseErrorValidateAmount != '') {
        return response(undefined, WrongCalculateAmount, iseErrorValidateAmount)
      }

      const parmasInsertHappyTransaction: InsertHappyPointToDbParams = {
        refId,
        amount,
        point,
        fee: happyPointFeePercent,
        exchangeRate: happyPointSellRate,
        fromHappyPointId: happyPointId,
        totalAmount: amount,
        type: 'SELL',
        note: 'DEBIT',
        status: 'SUCCESS',
      }
      const [, isErrorInsertHappyTransaction] = await (
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

      const [, requestSellHappyPointError] = await (await updateWalletToDb)(
        wallet.id,
        amount,
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

      const [updateBalaceMember, isErrorUpdateDebitBalanceMemberToDb] = await (
        await updateDebitBalanceMemberToDb
      )(parmasUpdateCreditMember)

      if (isErrorUpdateDebitBalanceMemberToDb != '') {
        return response(
          undefined,
          UnableUpdateDebitBalanceMemberToDb,
          isErrorUpdateDebitBalanceMemberToDb,
        )
      }

      this.logger.info(`Done SellHappyPointHandler ${dayjs().diff(start)} ms`)
      return response(updateBalaceMember)
    }
  }

  TransferHappyPointHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryRefIdExistTransaction: Promise<InquiryRefIdExistInTransactionType>,
    getLookupToRedis: Promise<GetCacheLookupToRedisType>,
    validateFeePoint: Promise<ValidateCalculateFeePointType>,
    validatePoint: Promise<ValidateCalculatePointByTotalPointAndFeeType>,
    validateLimitTransfer: Promise<ValidateLimitTransferType>,
    inquiryWalletIdFromUsername: Promise<InquiryHappyPointFromUsernameType>,
    insertHappyPointTypeBuyToDb: Promise<InsertHappyPointTypeBuyToDbType>,
    updateCreditBalanceMemberToDb: Promise<UpdateCreditBalanceToDbType>,
    updateDebitBalanceMemberToDb: Promise<UpdateDebitBalanceToDbType>,
    updateDebitLimitTransferToDb: Promise<UpdateDebitLimitTransferToDbType>,
  ) {
    return async (
      happyPoint: HappyPoint,
      member: Member,
      body: TransferHappyPointDto,
    ) => {
      const start = dayjs()
      const { id: happyPointId } = happyPoint
      const { point, refId, toMemberUsername, totalPoint, feePoint } = body

      const verifyOtpData: verifyOtpRequestDto = {
        reference: member.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
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

      const [lookup, isErrorGetLookupToRedis] = await (await getLookupToRedis)(
        refId,
      )
      if (isErrorGetLookupToRedis != '') {
        return response(
          undefined,
          UnableLookupExchangeRate,
          isErrorGetLookupToRedis,
        )
      }

      const {
        happyPointTransferRate,
        happyPointFeePercent: feePointRate,
      } = lookup
      const isErrorValidteFeePoint = await (await validateFeePoint)(
        totalPoint,
        feePointRate,
        feePoint,
      )
      if (isErrorValidteFeePoint) {
        return response(undefined, ComplicatedFeePoint, isErrorValidteFeePoint)
      }

      const isErrorValidatePoint = await (await validatePoint)(
        totalPoint,
        feePoint,
        point,
      )

      if (isErrorValidatePoint != '') {
        return response(undefined, WrongCalculatePoint, isErrorValidatePoint)
      }

      const isErrorValidateLimitTransfer = await (await validateLimitTransfer)(
        happyPoint.limitTransfer,
        point,
      )

      if (isErrorValidateLimitTransfer) {
        return response(
          undefined,
          OverLimitTransferPerday,
          isErrorValidateLimitTransfer,
        )
      }

      const [toHappyPoint, isErrorToHappyPoint] = await (
        await inquiryWalletIdFromUsername
      )(toMemberUsername)
      if (isErrorToHappyPoint != '') {
        return response(
          undefined,
          UnableInquiryWalletIdFromUsername,
          isErrorToHappyPoint,
        )
      }

      if (toHappyPoint.id === happyPointId) {
        return response(
          undefined,
          UnableTransferToMySelf,
          'Cannot transfer to myself',
        )
      }

      const parmasUpdateDebitMember: UpdateBalanceToDbParams = {
        happyPoint,
        point,
      }
      const [
        updateToBalaceMember,
        isErrorUpdateDebitBalanceMemberToDb,
      ] = await (await updateDebitBalanceMemberToDb)(parmasUpdateDebitMember)

      if (isErrorUpdateDebitBalanceMemberToDb != '') {
        return response(
          undefined,
          UnableUpdatHappyPointDebitTransferToDb,
          isErrorUpdateDebitBalanceMemberToDb,
        )
      }

      const parmasUpdateCreditMember: UpdateBalanceToDbParams = {
        happyPoint: toHappyPoint,
        point,
      }
      const [, isErrorUpdateCreditBalanceMemberToDb] = await (
        await updateCreditBalanceMemberToDb
      )(parmasUpdateCreditMember)

      if (isErrorUpdateCreditBalanceMemberToDb != '') {
        return response(
          undefined,
          UnableUpdatHappyPointCreditTransferToDb,
          isErrorUpdateCreditBalanceMemberToDb,
        )
      }

      const parmasToHappyPointInsertHappyTransaction: InsertHappyPointToDbParams = {
        refId,
        point,
        feePoint,
        totalPoint,
        exchangeRate: happyPointTransferRate,
        fromHappyPointId: toHappyPoint.id,
        toHappyPointId: happyPointId,
        type: 'TRANSFER',
        note: 'CREDIT',
        status: 'SUCCESS',
      }
      const [, isErrorToInsertHappyTransaction] = await (
        await insertHappyPointTypeBuyToDb
      )(parmasToHappyPointInsertHappyTransaction)
      if (isErrorToInsertHappyTransaction != '') {
        return response(
          undefined,
          UnableToHappyPointInserttHappyPointTypeBuyToDb,
          isErrorToInsertHappyTransaction,
        )
      }

      const parmasFromHappyPointInsertHappyTransaction: InsertHappyPointToDbParams = {
        refId,
        point,
        feePoint,
        totalPoint,
        exchangeRate: happyPointTransferRate,
        fromHappyPointId: happyPointId,
        toHappyPointId: toHappyPoint.id,
        type: 'TRANSFER',
        note: 'DEBIT',
        status: 'SUCCESS',
      }
      const [, isErrorFromInsertHappyTransaction] = await (
        await insertHappyPointTypeBuyToDb
      )(parmasFromHappyPointInsertHappyTransaction)
      if (isErrorFromInsertHappyTransaction != '') {
        return response(
          undefined,
          UnableFromHappyPointInserttHappyPointTypeBuyToDb,
          isErrorFromInsertHappyTransaction,
        )
      }

      const isErrorUpdateDebitLimitTransferToDb = await (
        await updateDebitLimitTransferToDb
      )(updateToBalaceMember, point)
      if (isErrorUpdateDebitLimitTransferToDb != '') {
        return response(
          undefined,
          UnableUpdateDebitLimitTransferToDb,
          isErrorUpdateDebitLimitTransferToDb,
        )
      }

      this.logger.info(
        `Done TransferHappyPointHandler ${dayjs().diff(start)} ms`,
      )

      return response(updateToBalaceMember)
    }
  }

  async ValidateCalculatePointByExchangeAndAmountFunc(): Promise<
    ValidateCalculatePointByExchangeAndAmountType
  > {
    return async (amount: number, exchangeRage: number, point: number) => {
      if (amount / exchangeRage !== point) {
        return 'Calculate wrong point'
      }

      return ''
    }
  }

  async ValidateCalculatePointByTotalPointAndFeeFunc(): Promise<
    ValidateCalculatePointByTotalPointAndFeeType
  > {
    return async (totalPoint: number, fee: number, point: number) => {
      console.log('totalPoint - fee', totalPoint - fee)
      if (totalPoint - fee !== point) {
        return 'Calculate wrong point'
      }

      return ''
    }
  }

  async ValidateCalculateFeePointFunc(): Promise<
    ValidateCalculateFeePointType
  > {
    return async (
      totalPoint: number,
      feePointRate: number,
      feePoint: number,
    ) => {
      if (totalPoint * (feePointRate / 100) !== feePoint) {
        return 'Calculate wrong feePoint'
      }

      return ''
    }
  }

  async ValidateCalculateAmountFunc(): Promise<ValidateCalculateAmountType> {
    return async (totalAmount: number, fee: number, amount: number) => {
      if (totalAmount - fee !== amount) {
        return 'Calculate wrong amount'
      }

      return ''
    }
  }

  async ValidateCalculateFeeAmountFunc(): Promise<
    ValidateCalculateFeeAmountType
  > {
    return async (
      totalAmount: number,
      feeAmountRate: number,
      feeAmount: number,
    ) => {
      if (totalAmount * (feeAmountRate / 100) !== feeAmount) {
        return 'Calculate wrong feeAmount'
      }

      return ''
    }
  }

  async InsertHappyPointTransactionToDbFunc(
    etm: EntityManager,
  ): Promise<InsertHappyPointTypeBuyToDbType> {
    return async (params: InsertHappyPointToDbParams) => {
      const start = dayjs()
      let happyPointTransaction: HappyPointTransaction

      try {
        happyPointTransaction = await etm.create(HappyPointTransaction, {
          ...params,
        })
        await etm.save(happyPointTransaction)
      } catch (error) {
        return [happyPointTransaction, error.message]
      }

      this.logger.info(
        `Done InsertHappyPointToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [happyPointTransaction, '']
    }
  }

  async UpdateCreditBalanceMemberToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateCreditBalanceToDbType> {
    return async (params: UpdateBalanceToDbParams) => {
      const start = dayjs()
      const { happyPoint, point } = params
      try {
        const newBalance = point + happyPoint.balance
        console.log('newBalance = point + happyPoint.balance', newBalance)

        await etm.update(HappyPoint, happyPoint.id, {
          balance: newBalance,
        })
        happyPoint.balance = newBalance
      } catch (error) {
        return [happyPoint, error.message]
      }

      this.logger.info(
        `Done UpdateCreditBalanceMemberToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [happyPoint, '']
    }
  }

  async UpdatDebitBalanceMemberToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateDebitBalanceToDbType> {
    return async (params: UpdateBalanceToDbParams) => {
      const start = dayjs()
      const { happyPoint, point } = params

      if (happyPoint.balance < point) {
        return [happyPoint, 'point not enough for transfer']
      }

      try {
        const newBalance = happyPoint.balance - point
        console.log('newBalance = happyPoint.balance - point', newBalance)

        await etm.update(HappyPoint, happyPoint.id, {
          balance: newBalance,
        })
        happyPoint.balance = newBalance
      } catch (error) {
        return [happyPoint, error.message]
      }

      this.logger.info(
        `Done UpdateDebitBalanceMemberToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [happyPoint, '']
    }
  }

  async InquiryHappyPointFromUsernameFunc(
    etm: EntityManager,
  ): Promise<InquiryHappyPointFromUsernameType> {
    return async (username: string) => {
      let happyPoint: HappyPoint
      try {
        happyPoint = await etm
          .createQueryBuilder(HappyPoint, 'happyPoints')
          .innerJoin('happyPoints.member', 'members')
          .where('members.username = :username', { username })
          .getOne()

        if (!happyPoint) {
          return [null, 'HappyPoint not found by username']
        }
      } catch (error) {
        return [happyPoint, error.message]
      }

      return [happyPoint, '']
    }
  }

  async InsertHappyPointToDbFunc(
    etm: EntityManager,
  ): Promise<InsertHappyPointToDbType> {
    return async (memberId: string): Promise<[HappyPoint, string]> => {
      const start = dayjs()
      let happyPoint: HappyPoint

      try {
        happyPoint = etm.create(HappyPoint, { memberId })
        await etm.save(happyPoint)
      } catch (error) {
        return [happyPoint, error.message]
      }

      this.logger.info(
        `Done InsertHappyPointToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [happyPoint, '']
    }
  }

  async ValidateLimitTransferFunc(): Promise<ValidateLimitTransferType> {
    return async (limitTransfer: number, point: number): Promise<string> => {
      if (limitTransfer < point) {
        return `over limit transfer per day`
      }
      return ''
    }
  }

  UpdateResetLimitTransferHandler(
    inquiryMasterConfig: Promise<InquiryMasterConfigType>,
    updateResetLimitTransfer: Promise<UpdateResetLimitTransferType>,
  ) {
    return async () => {
      console.log('Start UpdateResetLimitTransferHandler')
      const start = dayjs()
      const [masterConfig, isErrorInquiryMasterConfig] = await (
        await inquiryMasterConfig
      )()
      if (isErrorInquiryMasterConfig != '') {
        return response(
          undefined,
          UnableInquiryMasterConfig,
          isErrorInquiryMasterConfig,
        )
      }

      const isErrorUpdateResetLimitTransfer = await (
        await updateResetLimitTransfer
      )(masterConfig.config.happyPointTransferPercentLimit)
      if (isErrorUpdateResetLimitTransfer != '') {
        return response(
          undefined,
          UnableUpdateResetLimitTransfer,
          isErrorUpdateResetLimitTransfer,
        )
      }

      this.logger.info(
        `Done UpdateResetLimitTransferHandler ${dayjs().diff(start)} ms`,
      )
      return response(undefined)
    }
  }

  async UpdateDebitLimitTransferToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateDebitLimitTransferToDbType> {
    return async (happyPoint: HappyPoint, point: number): Promise<string> => {
      try {
        happyPoint.limitTransfer -= point
        await etm.save(happyPoint)
      } catch (error) {
        return error.message
      }
      return ''
    }
  }

  async UpdateCreditLimitTransferToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateCreditLimitTransferToDbType> {
    return async (happyPoint: HappyPoint, point: number): Promise<string> => {
      try {
        happyPoint.limitTransfer += point
        await etm.save(happyPoint)
      } catch (error) {
        return error.message
      }
      return ''
    }
  }

  async UpdateResetLimitTransferFunc(
    etm: EntityManager,
  ): Promise<UpdateResetLimitTransferType> {
    return async (happyPointTransferPercentLimit: number): Promise<string> => {
      const start = dayjs()
      try {
        const happyPoints = await etm.find(HappyPoint, { withDeleted: false })
        const updateHappyPoints = happyPoints.map((happyPoint: HappyPoint) => {
          const { balance } = happyPoint

          happyPoint.limitTransfer =
            balance * (happyPointTransferPercentLimit / 100)

          return happyPoint
        })

        etm.save(updateHappyPoints)
      } catch (error) {
        return error.message
      }

      this.logger.info(
        `Done UpdateResetLimitTransferFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}

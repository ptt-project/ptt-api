import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { HappyPointTransaction } from 'src/db/entities/HappyPointTransaction'
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
} from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.type'
import { BuyHappyPointRequestDto } from './dto/buy.dto'
import { TransferHappyPointDto } from './dto/transfer.dto'
import {
  InsertHappyPointTypeBuyToDbType,
  InsertHappyPointToDbParams,
  UpdateCreditBalanceToDbType,
  UpdateBalanceToDbParams,
  UpdateDebitBalanceToDbType,
  LookupExchangeRageType,
  ValidatePointType,
  InsertHappyPointToDbType,
  InquiryHappyPointFromUsernameType,
} from './happy-point.type'

@Injectable()
export class HappyPointService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(HappyPointService.name)
  }

  BuyHappyPointHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    lookupExchangeRate: Promise<LookupExchangeRageType>,
    validatePoint: Promise<ValidatePointType>,
    insertHappyPointTypeBuyToDb: Promise<InsertHappyPointTypeBuyToDbType>,
    updateCreditBalanceMemberToDb: Promise<UpdateCreditBalanceToDbType>,
  ) {
    return async (happyPoint: HappyPoint, body: BuyHappyPointRequestDto) => {
      const start = dayjs()
      const { id: happyPointId } = happyPoint
      const { amount, point, refId } = body

      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const [exchangeRate, isErrorLookupExchangeRate] = await (
        await lookupExchangeRate
      )(refId)
      if (isErrorLookupExchangeRate != '') {
        return response(
          undefined,
          UnableLookupExchangeRate,
          isErrorLookupExchangeRate,
        )
      }

      const iseErrorValidatePoint = await (await validatePoint)(
        amount,
        exchangeRate,
        point,
      )

      if (iseErrorValidatePoint != '') {
        return response(undefined, WrongCalculatePoint, iseErrorValidatePoint)
      }

      const parmasInsertHappyTransaction: InsertHappyPointToDbParams = {
        refId,
        amount,
        point,
        exchangeRate,
        fromHappyPointId: happyPointId,
        totalAmount: amount,
        type: 'BUY',
        note: 'CREDIT',
        status: 'PENDING',
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

  TransferHappyPointHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    lookupExchangeRate: Promise<LookupExchangeRageType>,
    inquiryWalletIdFromUsername: Promise<InquiryHappyPointFromUsernameType>,
    insertHappyPointTypeBuyToDb: Promise<InsertHappyPointTypeBuyToDbType>,
    updateCreditBalanceMemberToDb: Promise<UpdateCreditBalanceToDbType>,
    updateDebitBalanceMemberToDb: Promise<UpdateDebitBalanceToDbType>,
  ) {
    return async (happyPoint: HappyPoint, body: TransferHappyPointDto) => {
      const start = dayjs()
      const { id: happyPointId } = happyPoint
      const { point, refId, toMemberUsername, totalPoint, feePoint } = body

      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const [exchangeRate, isErrorLookupExchangeRate] = await (
        await lookupExchangeRate
      )(refId)
      if (isErrorLookupExchangeRate != '') {
        return response(
          undefined,
          UnableLookupExchangeRate,
          isErrorLookupExchangeRate,
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

      const parmasFromHappyPointInsertHappyTransaction: InsertHappyPointToDbParams = {
        refId,
        point,
        feePoint,
        totalPoint,
        exchangeRate,
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

      const parmasToHappyPointInsertHappyTransaction: InsertHappyPointToDbParams = {
        refId,
        point,
        feePoint,
        totalPoint,
        exchangeRate,
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

      this.logger.info(
        `Done TransferHappyPointHandler ${dayjs().diff(start)} ms`,
      )

      return response(updateToBalaceMember)
    }
  }

  async ValidatePointFunc(): Promise<ValidatePointType> {
    return async (amount: number, exchangeRage: number, point: number) => {
      if (amount / exchangeRage === point) {
        return ''
      } else {
        return 'Calculate wrong poin'
      }
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
        return [happyPointTransaction, error]
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
        return [happyPoint, error]
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
        return [happyPoint, error]
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
        return [happyPoint, error]
      }

      return [happyPoint, '']
    }
  }

  async InsertHappyPointToDbFunc(
    etm: EntityManager,
  ): Promise<InsertHappyPointToDbType> {
    return async (memberId: number): Promise<[HappyPoint, string]> => {
      const start = dayjs()
      let happyPoint: HappyPoint

      try {
        happyPoint = etm.create(HappyPoint, { memberId })
        await etm.save(happyPoint)
      } catch (error) {
        return [happyPoint, error]
      }

      this.logger.info(
        `Done InsertHappyPointToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [happyPoint, '']
    }
  }
}

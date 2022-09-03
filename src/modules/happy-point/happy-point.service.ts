import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { HappyPointTransaction } from 'src/db/entities/HappyPointTransaction'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import {
  UnableLookupExchangeRate,
  UnableInserttHappyPointTypeBuyToDb,
  WrongCalculatePoint,
} from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.type'
import { BuyHappyPointRequestDto } from './dto/buy.dto'
import {
  InsertHappyPointTypeBuyToDbType,
  InsertHappyPointToDbParams,
  UpdateCreditBalanceMemberToDbType,
  UpdateCreditBalanceMemberToDbParams,
  LookupExchangeRageType,
  ValidatePointType,
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
    updateCreditBalanceMemberToDb: Promise<UpdateCreditBalanceMemberToDbType>,
  ) {
    return async (member: Member, body: BuyHappyPointRequestDto) => {
      const start = dayjs()
      const { id: memberId } = member
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
        fromMemberId: memberId,
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

      const parmasUpdateCreditMember: UpdateCreditBalanceMemberToDbParams = {
        member,
        point,
      }

      const [updateBalaceMember, isErrorUpdateCreditBalanceMemberToDb] = await (
        await updateCreditBalanceMemberToDb
      )(parmasUpdateCreditMember)

      if (isErrorUpdateCreditBalanceMemberToDb != '') {
        return response(
          undefined,
          UnableInserttHappyPointTypeBuyToDb,
          isErrorUpdateCreditBalanceMemberToDb,
        )
      }

      this.logger.info(`Done BuyHappyPointHandler ${dayjs().diff(start)} ms`)
      return response(updateBalaceMember)
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

  async InsertHappyPointToDbFunc(
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
  ): Promise<UpdateCreditBalanceMemberToDbType> {
    return async (params: UpdateCreditBalanceMemberToDbParams) => {
      const start = dayjs()
      const { member, point } = params
      try {
        const newBalance = point + member.balance

        await etm.update(Member, member.id, {
          balance: newBalance,
        })
        member.balance = newBalance
      } catch (error) {
        return [member, error]
      }

      this.logger.info(
        `Done UpdateCreditBalanceMemberToDbFunc ${dayjs().diff(start)} ms`,
      )
      return [member, '']
    }
  }
}

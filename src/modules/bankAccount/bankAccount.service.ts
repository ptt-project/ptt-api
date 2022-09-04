import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import {
  UnableToGetBankAccount,
} from 'src/utils/response-code'

import {
  InqueryBankAccountFormDbFuncType, InsertBankAccountFormDbFuncType,
  } from './bankAccount.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { Member } from 'src/db/entities/Member'
import { EntityManager } from 'typeorm'
import { BankAccount } from 'src/db/entities/BankAccount'
import { CreateBankAccoutRequestDTO, GetBankAccoutRequestDTO } from './dto/BankAccount.dto'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.type'

@Injectable()
export class BankAccountService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(BankAccountService.name)
  }

  GetBankAccountsHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inqueryBankAccount: Promise<InqueryBankAccountFormDbFuncType>
  ) {
    return async (member: Member, body: GetBankAccoutRequestDTO) => {
      const start = dayjs()

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

      const [bankAccounts, getBankAccountError] = await (await inqueryBankAccount)(
        member.id,
      )

      if (getBankAccountError != '') {
        return response(undefined, UnableToGetBankAccount, getBankAccountError)
      }

      this.logger.info(`Done GetBankAccountsHandler ${dayjs().diff(start)} ms`)
      return response(bankAccounts)
    }
  }

  CreateBankAccountsHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    insertBankAccount: Promise<InsertBankAccountFormDbFuncType>
  ) {
    return async (member: Member, body: CreateBankAccoutRequestDTO) => {
      const start = dayjs()

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

      const [bankAccount, getBankAccountError] = await (await insertBankAccount)(
        member.id,
        body.fullName,
        body.thaiId,
        body.bankCode,
        body.accountNumber,
        body.accountHolder,
      )

      if (getBankAccountError != '') {
        return response(undefined, UnableToGetBankAccount, getBankAccountError)
      }

      this.logger.info(`Done CreateBankAccountsHandler ${dayjs().diff(start)} ms`)
      return response(bankAccount)
    }
  }

  async InqueryBankAccountsFormDbFunc(etm: EntityManager): Promise<InqueryBankAccountFormDbFuncType> {
    return async (
      memberId: number,
    ): Promise<[BankAccount[], string]> => {
      const start = dayjs()
      let bankAccounts: BankAccount[]

      try {
        bankAccounts = await etm.find(BankAccount, { where: { memberId, deletedAt: null } })
        
      } catch (error) {
        return [bankAccounts, error]
      }

      this.logger.info(`Done InqueryBankAccountsFromDbFunc ${dayjs().diff(start)} ms`)
      return [bankAccounts, '']
    }
  }

  async InsertBankAccountsFormDbFunc(etm: EntityManager): Promise<InsertBankAccountFormDbFuncType> {
    return async (
      memberId: number,
      fullName: string,
      thaiId: string,
      bankCode: string,
      accountNumber: string,
      accountHolder: string,
    ): Promise<[BankAccount, string]> => {
      const start = dayjs()
      let bankAccount: BankAccount

      try {
        bankAccount = await etm.create(BankAccount, {
          memberId,
          fullName,
          thaiId,
          bankCode,
          accountNumber,
          accountHolder,
        })
        bankAccount = await etm.save(bankAccount)
        
      } catch (error) {
        return [bankAccount, error]
      }

      this.logger.info(`Done InsertBankAccountsFormDbFunc ${dayjs().diff(start)} ms`)
      return [bankAccount, '']
    }
  }
}

import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import {
  UnableToDeleteBankAccount,
  UnableToGetBankAccount, UnableToInqueryBankAccount, UnableToInsertBankAccount, UnableToSetMainBankAccount, UnableToUpdateBankAccount, ValidateBankAccount,
} from 'src/utils/response-code'

import {
  DeleteBankAccountFormDbFuncType,
  InqueryBankAccountFormDbFuncType,
  InqueryBankAccountsFormDbFuncType, InsertBankAccountFormDbFuncType, SetMainBankAccountFuncType, UpdateBankAccountFuncType, ValidateBankAccountFuncType,
  } from './bankAccount.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { Member } from 'src/db/entities/Member'
import { EntityManager } from 'typeorm'
import { BankAccount } from 'src/db/entities/BankAccount'
import { CreateBankAccoutRequestDTO, DeleteBankAccoutRequestDTO, GetBankAccoutRequestDTO } from './dto/BankAccount.dto'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.type'

@Injectable()
export class BankAccountService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(BankAccountService.name)
  }

  GetBankAccountsHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inqueryBankAccount: Promise<InqueryBankAccountsFormDbFuncType>
  ) {
    return async (member: Member, query: GetBankAccoutRequestDTO) => {
      const start = dayjs()

      const verifyOtpData: verifyOtpRequestDto = {
        reference: member.mobile,
        refCode: query.refCode,
        otpCode: query.otpCode,
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

  GetBankAccountOptionsHandler(
    inqueryBankAccount: Promise<InqueryBankAccountsFormDbFuncType>
  ) {
    return async (member: Member) => {
      const start = dayjs()

      const [bankAccounts, getBankAccountError] = await (await inqueryBankAccount)(
        member.id,
      )

      if (getBankAccountError != '') {
        return response(undefined, UnableToGetBankAccount, getBankAccountError)
      }

      const maskedBankAccounts = bankAccounts.map((bankAccount) => ({
        value: bankAccount.id,
        label: `${bankAccount.bankCode} **${
          bankAccount.accountNumber.slice(
            bankAccount.accountNumber.length - 4,
            bankAccount.accountNumber.length,
          )
        }${bankAccount.isMain ? ' [บัญชีหลัก]' : ''}`
      }))

      this.logger.info(`Done GetBankAccountOptionsHandler ${dayjs().diff(start)} ms`)
      return response(maskedBankAccounts)
    }
  }


  CreateBankAccountsHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    validateBankAccount: Promise<ValidateBankAccountFuncType>,
    insertBankAccount: Promise<InsertBankAccountFormDbFuncType>,
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

      const [validateBankAccountErrorMessege] = await (
        await validateBankAccount
      )(
        member.id, 
        body.bankCode,
        body.accountNumber,
      )

      if (validateBankAccountErrorMessege != '') {
        return response(undefined, ValidateBankAccount, validateBankAccountErrorMessege)
      }

      const [bankAccount, insertBankAccountError] = await (await insertBankAccount)(
        member.id,
        body.fullName,
        body.thaiId,
        body.bankCode,
        body.accountNumber,
        body.accountHolder,
      )

      if (insertBankAccountError != '') {
        return response(undefined, UnableToInsertBankAccount, insertBankAccountError)
      }

      this.logger.info(`Done CreateBankAccountsHandler ${dayjs().diff(start)} ms`)
      return response(bankAccount)
    }
  }

  EditBankAccountsHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inqueryBankAccount: Promise<InqueryBankAccountFormDbFuncType>,
    validateBankAccount: Promise<ValidateBankAccountFuncType>,
    updateBankAccount: Promise<UpdateBankAccountFuncType>,
  ) {
    return async (member: Member, bankAccountId: number,  body: CreateBankAccoutRequestDTO) => {
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

      const [bankAccount, inqueryBankAccountError] = await (
        await inqueryBankAccount
      )(member.id, bankAccountId)

      if (inqueryBankAccountError != '') {
        return response(undefined, UnableToInqueryBankAccount, inqueryBankAccountError)
      }

      const [validateBankAccountErrorMessege] = await (
        await validateBankAccount
      )(
        member.id,
        body.bankCode,
        body.accountNumber,
        bankAccountId,
      )

      if (validateBankAccountErrorMessege != '') {
        return response(undefined, ValidateBankAccount, validateBankAccountErrorMessege)
      }

      const [updatedBankAccount, updateBankAccountError] = await (await updateBankAccount)(
        bankAccount,
        body.fullName,
        body.thaiId,
        body.bankCode,
        body.accountNumber,
        body.accountHolder,
      )

      if (updateBankAccountError != '') {
        return response(undefined, UnableToUpdateBankAccount, updateBankAccountError)
      }

      this.logger.info(`Done EditBankAccountsHandler ${dayjs().diff(start)} ms`)
      return response(updatedBankAccount)
    }
  }

  DeleteBankAccountsHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inqueryBankAccount: Promise<InqueryBankAccountFormDbFuncType>,
    deleteBankAccount: Promise<DeleteBankAccountFormDbFuncType>,
  ) {
    return async (member: Member, bankAccountId: number,  body: DeleteBankAccoutRequestDTO) => {
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

      const [bankAccount, inqueryBankAccountError] = await (
        await inqueryBankAccount
      )(member.id, bankAccountId)

      if (inqueryBankAccountError != '') {
        return response(undefined, UnableToInqueryBankAccount, inqueryBankAccountError)
      }

      const [deleteBankAccountError] = await (await deleteBankAccount)(
        bankAccount,
      )

      if (deleteBankAccountError != '') {
        return response(undefined, UnableToDeleteBankAccount, deleteBankAccountError)
      }

      this.logger.info(`Done EditBankAccountsHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  SetMainBankAccountsHandler(
    inqueryBankAccount: Promise<InqueryBankAccountFormDbFuncType>,
    setMainBankAccount: Promise<SetMainBankAccountFuncType>,
  ) {
    return async (member: Member, bankAccountId: number) => {
      const start = dayjs()

      const [bankAccount, inqueryBankAccountError] = await (
        await inqueryBankAccount
      )(member.id, bankAccountId)

      if (inqueryBankAccountError != '') {
        return response(undefined, UnableToInqueryBankAccount, inqueryBankAccountError)
      }

      const [setMainBankAccountError] = await (await setMainBankAccount)(
        bankAccount,
      )

      if (setMainBankAccountError != '') {
        return response(undefined, UnableToSetMainBankAccount, setMainBankAccountError)
      }

      this.logger.info(`Done SetMainBankAccountsHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InqueryBankAccountsFormDbFunc(etm: EntityManager): Promise<InqueryBankAccountsFormDbFuncType> {
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

      this.logger.info(`Done InqueryBankAccountsFormDbFunc ${dayjs().diff(start)} ms`)
      return [bankAccounts, '']
    }
  }

  async ValidateBankAccountFunc(etm: EntityManager): Promise<ValidateBankAccountFuncType> {
    return async (
      memberId,
      bankCode: string,
      accountNumber: string,
      bankAccountId?: number,
    ): Promise<[string]> => {
      const start = dayjs()
      let bankAccount: BankAccount

      try {
        bankAccount = await etm.findOne(BankAccount, {
          where: {
            memberId,
            bankCode,
            accountNumber,
            deletedAt: null,
          }
        })

        if (bankAccount && bankAccount.id !== bankAccountId) {
          return ['This bank account is already used for this member']
        }
        
      } catch (error) {
        return [error]
      }

      this.logger.info(`Done ValidateBankAccountFunc ${dayjs().diff(start)} ms`)
      return ['']
    }
  }


  async InqueryBankAccountFormDbFunc(etm: EntityManager): Promise<InqueryBankAccountFormDbFuncType> {
    return async (
      memberId: number,
      bankAccountId: number,
    ): Promise<[BankAccount, string]> => {
      const start = dayjs()
      let bankAccount: BankAccount

      try {
        bankAccount = await etm.findOne(BankAccount, {
          where: {
            memberId,
            id: bankAccountId,
            deletedAt: null,
          }
        })

        if (!bankAccount) {
          return [bankAccount, 'Bank account not found for this member']
        }
        
      } catch (error) {
        return [bankAccount, error]
      }

      this.logger.info(`Done InqueryBankAccountFormDbFunc ${dayjs().diff(start)} ms`)
      return [bankAccount, '']
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
        const oldMainAccounts: BankAccount[] = await etm.find(BankAccount, {
          where: {
            memberId,
            isMain: true,
            deletedAt: null,
          }
        })

        let isMain: boolean
        if (oldMainAccounts.length == 0) {
          isMain = true
        }

        bankAccount = await etm.create(BankAccount, {
          memberId,
          fullName,
          thaiId,
          bankCode,
          accountNumber,
          accountHolder,
          isMain,
        })
        bankAccount = await etm.save(bankAccount)
        
      } catch (error) {
        return [bankAccount, error]
      }

      this.logger.info(`Done InsertBankAccountsFormDbFunc ${dayjs().diff(start)} ms`)
      return [bankAccount, '']
    }
  }

  async UpdateBankAccountFunc(etm: EntityManager): Promise<UpdateBankAccountFuncType> {
    return async (
      bankAccount: BankAccount,
      fullName: string,
      thaiId: string,
      bankCode: string,
      accountNumber: string,
      accountHolder: string,
    ): Promise<[BankAccount, string]> => {
      const start = dayjs()

      try {
        bankAccount.fullName = fullName
        bankAccount.thaiId = thaiId
        bankAccount.bankCode = bankCode
        bankAccount.accountNumber = accountNumber
        bankAccount.accountHolder = accountHolder
        bankAccount = await etm.save(bankAccount)
        
      } catch (error) {
        return [bankAccount, error]
      }

      this.logger.info(`Done UpdateBankAccountsFunc ${dayjs().diff(start)} ms`)
      return [bankAccount, '']
    }
  }

  async DeleteBankAccountFormDbFunc(etm: EntityManager): Promise<DeleteBankAccountFormDbFuncType> {
    return async (
      bankAccount: BankAccount
    ): Promise<[string]> => {
      const start = dayjs()

      try {
         await etm.softRemove(bankAccount)
      } catch (error) {
        return [error]
      }

      this.logger.info(`Done DeleteBankAccountFormDbFunc ${dayjs().diff(start)} ms`)
      return ['']
    }
  }

  async SetMainBankAccountFunc(etm: EntityManager): Promise<DeleteBankAccountFormDbFuncType> {
    return async (
      bankAccount: BankAccount
    ): Promise<[string]> => {
      const start = dayjs()

      try {
        const oldMainAccounts: BankAccount[] = await etm.find(BankAccount, {
          where: {
            memberId: bankAccount.memberId,
            isMain: true,
            deletedAt: null,
          }
        })

        for (const account of oldMainAccounts) {
          account.isMain = false
        }
        if (oldMainAccounts.length > 0) {
          await etm.save(oldMainAccounts)
        }

        bankAccount.isMain = true
        await etm.save(bankAccount)


      } catch (error) {
        return [error]
      }

      this.logger.info(`Done SetMainBankAccountFunc ${dayjs().diff(start)} ms`)
      return ['']
    }
  }
}

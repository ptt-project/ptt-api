import { BankAccount } from 'src/db/entities/BankAccount'

export type InqueryBankAccountsFormDbFuncType = (
  memberId: number,
) => Promise<[BankAccount[], string]>

export type InsertBankAccountFormDbFuncType = (
  memberId: number,
  fullName: string,
  thaiId: string,
  bankCode: string,
  accountNumber: string,
  accountHolder: string,
) => Promise<[BankAccount, string]>

export type UpdateBankAccountFuncType = (
  bankAccount: BankAccount,
  fullName: string,
  thaiId: string,
  bankCode: string,
  accountNumber: string,
  accountHolder: string,
) => Promise<[BankAccount, string]>

export type InqueryBankAccountFormDbFuncType = (
  memberId: number,
  bankAccountId: number,
) => Promise<[BankAccount, string]>

export type ValidateBankAccountFuncType = (
  memberId: number,
  bankCode: string,
  accountNumber: string,
  bankAccountId?: number,
) => Promise<[string]>

export type DeleteBankAccountFormDbFuncType = (
  bankAccount: BankAccount,
) => Promise<[string]>


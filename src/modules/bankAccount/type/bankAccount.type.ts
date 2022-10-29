import { BankAccount } from 'src/db/entities/BankAccount'

export type InqueryBankAccountsFormDbFuncType = (
  memberId: string,
) => Promise<[BankAccount[], string]>

export type InsertBankAccountFormDbFuncType = (
  memberId: string,
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
  memberId: string,
  bankAccountId: string,
) => Promise<[BankAccount, string]>

export type ValidateBankAccountFuncType = (
  memberId: string,
  bankCode: string,
  accountNumber: string,
  bankAccountId?: string,
) => Promise<[string]>

export type DeleteBankAccountFormDbFuncType = (
  bankAccount: BankAccount,
) => Promise<[string]>

export type SetMainBankAccountFuncType = (
  bankAccount: BankAccount,
) => Promise<[string]>

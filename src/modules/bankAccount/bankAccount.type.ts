import { BankAccount } from 'src/db/entities/BankAccount'

export type InqueryBankAccountFormDbFuncType = (
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

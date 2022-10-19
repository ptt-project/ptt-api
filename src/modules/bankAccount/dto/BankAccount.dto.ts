import {  IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { TransactionType } from 'src/db/entities/WalletTransaction'
import { Transform } from 'class-transformer'

export class GetBankAccoutRequestDTO {
  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}

export class CreateBankAccoutRequestDTO {
  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string

  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsString()
  @IsNotEmpty()
  thaiId: string

  @IsString()
  @IsNotEmpty()
  bankCode: string

  @IsString()
  @IsNotEmpty()
  accountNumber: string

  @IsString()
  @IsNotEmpty()
  accountHolder: string
}

export class EditBankAccoutRequestDTO {
  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string

  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsString()
  @IsNotEmpty()
  thaiId: string

  @IsString()
  @IsNotEmpty()
  bankCode: string

  @IsString()
  @IsNotEmpty()
  accountNumber: string

  @IsString()
  @IsNotEmpty()
  accountHolder: string
}
export class DeleteBankAccoutRequestDTO {
  @IsString()
  @IsNotEmpty()
  otpCode: string

  @IsString()
  @IsNotEmpty()
  refCode: string
}
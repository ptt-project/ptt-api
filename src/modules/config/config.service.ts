import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { InquiryAddressOptionsFormDbFuncType, InquiryBankOptionsFormDbFuncType, InquiryBrandOptionsFormDbFuncType, InquiryPlatformCategoryOptionsFormDbFuncType, OptionType } from './config.type'
import { UnableToGetAddressOptions, UnableToGetBankOptions, UnableToGetBrandOptions, UnableToGetPlatformCategoryOptions } from 'src/utils/response-code'
import { Brand } from 'src/db/entities/Brand'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'
import { Bank } from 'src/db/entities/Bank'
import { AddressMaster } from 'src/db/entities/AddressMaster'
@Injectable()
export class AppConfigService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AppConfigService.name)
  }
  
  GetMasterOptionsHandler(
    inqueryBrandOptions: Promise<InquiryBrandOptionsFormDbFuncType>,
    inqueryPlatformCategorydOptions: Promise<InquiryPlatformCategoryOptionsFormDbFuncType>,
    inqueryBankOptions: Promise<InquiryBankOptionsFormDbFuncType>,
    inqueryAddressOptions: Promise<InquiryAddressOptionsFormDbFuncType>,
  ) {
    return async () => {
      const start = dayjs()

      const [brand, getBrandOptionsError] = await (await inqueryBrandOptions)()

      if (getBrandOptionsError != '') {
        return response(
          undefined,
          UnableToGetBrandOptions,
          getBrandOptionsError,
        )
      }

      const [platformCategory, getPlatformCategoryptionsError] = await (await inqueryPlatformCategorydOptions)()

      if (getPlatformCategoryptionsError != '') {
        return response(
          undefined,
          UnableToGetPlatformCategoryOptions,
          getPlatformCategoryptionsError,
        )
      }

      const [bank, getBankOptionsError] = await (await inqueryBankOptions)()

      if (getBankOptionsError != '') {
        return response(
          undefined,
          UnableToGetBankOptions,
          getBankOptionsError,
        )
      }

      const [address, getAddressOptionsError] = await (await inqueryAddressOptions)()

      if (getAddressOptionsError != '') {
        return response(
          undefined,
          UnableToGetAddressOptions,
          getAddressOptionsError,
        )
      }

      this.logger.info(`Done GetMasterOptionsHandler ${dayjs().diff(start)} ms`)
      return response({ brand, platformCategory, bank, address })
    }
  }

  async InquiryBrandOptionsFormDbFunc(
    etm: EntityManager,
  ): Promise<InquiryBrandOptionsFormDbFuncType> {
    return async (): Promise<[OptionType[], string]> => {
      const start = dayjs()

      let brands: Brand[]
      try {
        brands = await etm.find(Brand, { where: { deletedAt: null } })
        
      } catch (error) {
        return [ undefined, error ]
      }

      this.logger.info(`Done InquiryBrandOptionsFormDbFunc ${dayjs().diff(start)} ms`)
      return [ brands.map(brand => ({ value: brand.id, label: brand.name })), '' ]
    }
  }

  async InquiryPlatformCategoryOptionsFormDbFunc(
    etm: EntityManager,
  ): Promise<InquiryPlatformCategoryOptionsFormDbFuncType> {
    return async (): Promise<[OptionType[], string]> => {
      const start = dayjs()

      let platformCategories: PlatformCategory[]
      try {
        platformCategories = await etm.find(PlatformCategory, { where: { deletedAt: null } })
        
      } catch (error) {
        return [ undefined, error ]
      }

      this.logger.info(`Done InquiryPlatformCategoryOptionsFormDbFunc ${dayjs().diff(start)} ms`)
      return [ platformCategories.map(platformCategory => ({ 
        value: platformCategory.id,
        label: platformCategory.name
      })), '' ]
    }
  }

  async InquiryBankOptionsFormDbFunc(
    etm: EntityManager,
  ): Promise<InquiryBankOptionsFormDbFuncType> {
    return async (): Promise<[OptionType[], string]> => {
      const start = dayjs()

      let banks: Bank[]
      try {
        banks = await etm.find(Bank, { where: { deletedAt: null } })
        
      } catch (error) {
        return [ undefined, error ]
      }

      this.logger.info(`Done InquiryBankOptionsFormDbFunc ${dayjs().diff(start)} ms`)
      return [ banks.map(bank => ({ 
        value: bank.bankCode,
        label: bank.name
      })), '' ]
    }
  }

  async InquiryAddressOptionsFormDbFunc(
    etm: EntityManager,
  ): Promise<InquiryAddressOptionsFormDbFuncType> {
    return async (): Promise<[any[], string]> => {
      const start = dayjs()

      let address: AddressMaster
      try {
        address = await etm.findOne(AddressMaster, { where: { deletedAt: null } })
        
      } catch (error) {
        return [ undefined, error ]
      }

      this.logger.info(`Done InquiryAddressOptionsFormDbFunc ${dayjs().diff(start)} ms`)
      return [address.data, '']
    }
  }
}

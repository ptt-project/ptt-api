
export type OptionType = {
  value: number | string,
  label: string,
}

export type InquiryBrandOptionsFormDbFuncType = () => Promise<[OptionType[], string]>

export type InquiryPlatformCategoryOptionsFormDbFuncType = () => Promise<[OptionType[], string]>

export type InquiryBankOptionsFormDbFuncType = () => Promise<[OptionType[], string]>

export type InquiryAddressOptionsFormDbFuncType = () => Promise<[OptionType[], string]>
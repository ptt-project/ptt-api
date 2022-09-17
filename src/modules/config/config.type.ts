
export type OptionType = {
  value: number | string,
  label: string,
}

export type LanguageOptionType = 'EN' | 'TH'

export type InquiryBrandOptionsFormDbFuncType = () => Promise<[OptionType[], string]>

export type InquiryPlatformCategoryOptionsFormDbFuncType = () => Promise<[OptionType[], string]>

export type InquiryBankOptionsFormDbFuncType = (lang: LanguageOptionType) => Promise<[OptionType[], string]>

export type InquiryAddressOptionsFormDbFuncType = () => Promise<[any[], string]>
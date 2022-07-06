const _validateError = 100000

export const InternalSeverError = _validateError + 1
export const InvalidJSONString = _validateError + 2
export const UnableRegisterEmailAlreayExist = _validateError + 4
export const UnableRegisterUsernameAlreayExist = _validateError + 5
export const UnableInsertMemberToDbError = _validateError + 6
export const UnableVerifyOtpIncorrect = _validateError + 7
export const UnableVerifyOtpDataNotfound = _validateError + 8
export const UnableVerifyOtpLimitExceeded = _validateError + 9
export const UnableVerifyOtpIsAreadyVerified = _validateError + 10
export const UnableToSendOtp = _validateError + 11
export const UnableLoginUsernameDoNotAlreayExist = _validateError + 12
export const PasswordIsInvalid = _validateError + 13
export const OldPassowrdInvalid = _validateError + 14
export const UnableUpatePasswordToDb = _validateError + 15
export const UnableInsertAddressToDb = _validateError + 21
export const UnableUpdateAddressToDb = _validateError + 22
export const UnableDeleteAddressById = _validateError + 23
export const UnableUpdateNotMainAddressByMemberId = _validateError + 24
export const UnableUpdateIsMainAddressById = _validateError + 25
export const UnableInquiryAddressById = _validateError + 26
export const UnableInquiryAddressesByMemberId = _validateError + 27

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
export const UnableInquiryMemberExistById = _validateError + 12
export const UnableUpatePasswordToDb = _validateError + 13

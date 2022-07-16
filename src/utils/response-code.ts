//base
const _validateError = 100000
export const InternalSeverError = _validateError + 1
export const InvalidJSONString = _validateError + 2

// auth module

// auth service
const _authError = 101000
export const UnableRegisterEmailAlreayExist = _authError + 1
export const UnableRegisterUsernameAlreayExist = _authError + 2
export const UnableInsertMemberToDbError = _authError + 3

// login
export const UnableLoginUsernameDoNotAlreayExist = _authError + 4
export const PasswordIsInvalid = _authError + 5

// otp module
const _otpError = 102000
export const UnableVerifyOtpIncorrect = _otpError + 1
export const UnableVerifyOtpDataNotfound = _otpError + 2
export const UnableVerifyOtpLimitExceeded = _otpError + 3
export const UnableVerifyOtpIsAreadyVerified = _otpError + 4
export const UnableToSendOtp = _otpError + 5

// member module
const _memberError = 103000

// member service
export const UnableUpateProfileToDb = _memberError + 1

// email service
export const OldPassowrdInvalid = _memberError + 2
export const UnableToUpdateEmailToDb = _memberError + 3
export const UnableToSendEmail = _memberError + 4

// password service
export const UnableUpatePasswordToDb = _memberError + 5

// mobile module
const _mobileError = 104000
export const UnableToAddMobile = _mobileError + 1
export const UnableToSetMainMobile = _mobileError + 2
export const UnableToDeleteMobile = _mobileError + 3

// address module
const _addressError = 105000
export const UnableInsertAddressToDb = _addressError + 1
export const UnableUpdateAddressToDb = _addressError + 2
export const UnableDeleteAddressById = _addressError + 3
export const UnableUpdateNotMainAddressByMemberId = _addressError + 4
export const UnableUpdateIsMainAddressById = _addressError + 5
export const UnableInquiryAddressById = _addressError + 6
export const UnableInquiryAddressesByMemberId = _addressError + 7
export const UnableUpdatePickupAddressByMemberId = _addressError + 8
export const UnableUpdateReturnItemAddressByMemberId = _addressError + 9

// seller module
const _sellerError = 106000
export const InvalidSellerRegister = _sellerError + 1
export const UnableInsertShopToDb = _sellerError + 2
export const UnableUpdateShopToDb = _sellerError + 3
export const UnableToGetShopInfo = _sellerError + 4
export const UnableToUpdateShopInfo = _sellerError + 5

// review module
const _reviewError = 107000
export const UnableInquiryInquiryReviewsBySellerId = _reviewError + 1
export const UnableInquiryReviewsByReviewId = _reviewError + 2
export const UnableReplyReviewByReviewId = _reviewError + 3

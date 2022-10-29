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
export const UnableInquiryUserExistByMemberId = _memberError + 2
export const UnableInquiryMemberByUsername = _memberError + 3

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
export const UnableToGetMobiles = _mobileError + 4

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
export const UnableCreatePartitionOfProductProfile = _sellerError + 6

// review module
const _reviewError = 107000
export const UnableInquiryInquiryReviewsBySellerId = _reviewError + 1
export const UnableInquiryReviewsByReviewId = _reviewError + 2
export const UnableReplyReviewByReviewId = _reviewError + 3

const _categoryError = 108000
export const UnableToGetCategories = _categoryError + 1
export const UnableToInsertCategory = _categoryError + 2
export const UnableToGetCategoryByCategoryId = _categoryError + 3
export const UnableToUpdateStatusCategory = _categoryError + 4
export const UnableToUpdatePriorityCategory = _categoryError + 5
export const UnableToOrdersIsInvalid = _categoryError + 6
export const UnableDeleteCategoryToDb = _categoryError + 7
export const UnableDeleteCategoryProductToDbByCategoryId = _categoryError + 8
export const UnableInsertCategoryProductToDb = _categoryError + 9
export const UnableUpdateCategoryToDb = _categoryError + 10
export const UnableDeleteCategoryProductToDb = _categoryError + 11
export const UnableinquiryProductProfileIdsByCategoryId = _categoryError + 12
export const UnableinquiryProductProfileByCatgoryIdFunc = _categoryError + 13
export const UnableInquiryCategoryByName = _categoryError + 14

const _productError = 109000
export const CreateProductValidationFailed = _productError + 1
export const UnableToCreateProductProfile = _productError + 2
export const UnableToCreateProductOptions = _productError + 3
export const UnableToCreateProducts = _productError + 4
export const UnableToGetProducts = _productError + 5
export const UnableInquiryProductProfileByProductProfileId = _productError + 6
export const UnableInquiryProductOptionsByProductProfileId = _productError + 7
export const UnableInquiryProductsByProductProfileId = _productError + 8
export const UnableDeleteProductProfileByProductProfileId = _productError + 9
export const UnableDeleteProductOptionsByProductProfileId = _productError + 10
export const UnableDeleteProductsByProductProfileId = _productError + 11
export const UnableUpdateStatusProductByProductProfileId = _productError + 12
export const UnableUpdateProductProfileByProductProfileId = _productError + 13
export const UnableRemoveProductOptionByProductOptionId = _productError + 14
export const UnableUpdateProductOption = _productError + 15
export const UnableRemoveProductsById = _productError + 16
export const UnableUpdateProduct = _productError + 17
export const UnableInquiryProductProfileFromDb = _productError + 18
export const UnableInquiryProductByProductIds = _productError + 19
export const UnableToGetProductPrice = _productError + 20

const _image = 110000
export const UnableResizeImage = _image + 1

const _walletError = 114000
export const UnableToInsertWallet = _walletError + 1
export const UnableToGetWalletTransaction = _walletError + 2
export const UnableToInsertTransaction = _walletError + 3
export const UnableToInsertReference = _walletError + 4
export const UnableToRequestDepositQrCode = _walletError + 5
export const UnableToAdjustWallet = _walletError + 6
export const UnableToInsertWithdrawReference = _walletError + 7
export const UnableToRequestWithdraw = _walletError + 8
export const UnableToUpdateReference = _walletError + 9

const _bankAccountError = 115000
export const UnableToGetBankAccount = _bankAccountError + 1
export const UnableToInqueryBankAccount = _bankAccountError + 2
export const UnableToInsertBankAccount = _bankAccountError + 3
export const UnableToUpdateBankAccount = _bankAccountError + 4
export const ValidateBankAccount = _bankAccountError + 5
export const UnableToDeleteBankAccount = _bankAccountError + 6
export const UnableToSetMainBankAccount = _bankAccountError + 7

const _happyPoint = 120000
export const UnableInsertLookupToDb = _happyPoint + 1
export const UnableLookupExchangeRate = _happyPoint + 2
export const WrongCalculatePoint = _happyPoint + 3
export const UnableInserttHappyPointTypeBuyToDb = _happyPoint + 4
export const UnableUpdateCreditBalanceMemberToDb = _happyPoint + 5
export const UnableToInsertHappyPoint = _happyPoint + 6
export const UnableInquiryWalletIdFromUsername = _happyPoint + 7
export const UnableFromHappyPointInserttHappyPointTypeBuyToDb = _happyPoint + 8
export const UnableToHappyPointInserttHappyPointTypeBuyToDb = _happyPoint + 9
export const UnableUpdatHappyPointCreditTransferToDb = _happyPoint + 10
export const UnableUpdatHappyPointDebitTransferToDb = _happyPoint + 11
export const UnableTransferToMySelf = _happyPoint + 12
export const UpdateWalletWithBuyHappyPoint = _happyPoint + 13
export const UpdateWalletWithSellHappyPoint = _happyPoint + 14
export const WrongCalculateAmount = _happyPoint + 15
export const ComplicatedFeePoint = _happyPoint + 16
export const ComplicatedFeeAmount = _happyPoint + 17
export const UnableUpdateDebitBalanceMemberToDb = _happyPoint + 18
export const UnableDuplicateRefId = _happyPoint + 19
export const UnableInquiryRefIdExistTransactions = _happyPoint + 20
export const UnableInquiryMasterConfig = _happyPoint + 21
export const OverLimitTransferPerday = _happyPoint + 22
export const UnableUpdateResetLimitTransfer = _happyPoint + 23
export const UnableUpdateDebitLimitTransferToDb = _happyPoint + 24
export const UnableInquiryHappyPointTransactionToDb = _happyPoint + 25

const _config = 300000
export const UnableToGetBrandOptions = _config + 1
export const UnableToGetPlatformCategoryOptions = _config + 2
export const UnableToGetBankOptions = _config + 3
export const UnableToGetAddressOptions = _config + 4

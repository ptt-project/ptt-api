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

const _image = 110000
export const UnableResizeImage = _image + 1

const _promotion = 112000
export const UnableToGetPromotionError = _promotion + 1
export const ValidatePromotionError = _promotion + 2
export const UnableToCreatePromotionError = _promotion + 3
export const UnableToUpdatePromotionError = _promotion + 4
export const UnableToDeletePromotionError = _promotion + 5

const _flashSale = 121000
export const UnableToInquiryFlashSaleError = _flashSale + 1
export const ValidateFlashSaleError = _flashSale + 2
export const UnableToCreateFlashSaleError = _flashSale + 3
export const UnableToUpdateFlashSaleError = _flashSale + 4
export const UnableToDeleteFlashSaleError = _flashSale + 5
export const UnableToGetFlashSaleRoundError = _flashSale + 6
export const UnableToInquiryFlashSaleByIdError = _flashSale + 7
export const UnableToGetFlashSaleForMemberError = _flashSale + 8

const _walletError = 114000
export const UnableToInsertWallet = _walletError + 1
export const UnableToGetWalletTransaction = _walletError + 2
export const UnableToInsertTransaction = _walletError + 3
export const UnableToInsertDepositReference = _walletError + 4
export const UnableToRequestDepositQrCode = _walletError + 5
export const UnableToAdjustWallet = _walletError + 6
export const UnableToInsertWithdrawReference = _walletError + 7
export const UnableToRequestWithdraw = _walletError + 8


const _bankAccountError = 115000
export const UnableToGetBankAccount = _bankAccountError + 1
export const UnableToInqueryBankAccount = _bankAccountError + 2
export const UnableToInsertBankAccount = _bankAccountError + 3
export const UnableToUpdateBankAccount = _bankAccountError + 4
export const ValidateBankAccount = _bankAccountError + 5
export const UnableToDeleteBankAccount = _bankAccountError + 6
export const UnableToSetMainBankAccount = _bankAccountError + 7


const _config = 300000
export const UnableToGetBrandOptions = _config + 1
export const UnableToGetPlatformCategoryOptions = _config + 2
export const UnableToGetBankOptions = _config + 3
export const UnableToGetAddressOptions = _config + 4

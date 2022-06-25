const _validateError = 100000

export const InternalSeverError = _validateError + 1
export const InvalidJSONString = _validateError + 2
export const UnableRegisterEmailAlreayExist = _validateError + 4
export const UnableRegisterUsernameAlreayExist = _validateError + 5
export const UnableInsertMemberToDbError = _validateError + 6
export const UnableLoginUsernameDoNotAlreayExist = _validateError + 7
export const PasswordIsInvalid = _validateError + 8
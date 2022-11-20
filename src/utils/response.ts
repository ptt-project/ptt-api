import { validateError } from './response-error'

export const response = (data: any, code = 0, message = 'success') => {
  if (code != 0) {
    return validateError(code, message)
  }

  return {
    code,
    message,
    data,
  }
}

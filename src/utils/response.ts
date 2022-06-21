export const response = (data: any, code = '0', message = 'success') => {
  return {
    code,
    message,
    data,
  }
}

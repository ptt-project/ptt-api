export const response = (data: any, code = 0, message = 'success') => {
  console.log('code', code)
  return {
    code,
    message,
    data,
  }
}

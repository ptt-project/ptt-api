import bcrypt from 'bcrypt'

export const randomStr = (length: number) => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const randomNum = (length: number) => {
  let result = ''
  const characters = '0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const checkPassword = async (password, encryptedPassword) => {
  return await bcrypt.compare(password, encryptedPassword)
}

export const hashPassword = async password => {
  const salt = await bcrypt.genSalt()
  return await bcrypt.hash(password, salt)
}

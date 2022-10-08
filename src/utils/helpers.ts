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

export const genUuid = () => {
  let dt = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export const padding = (num, n) => num.toString().padStart(n, "0")

export const getTimeFromDate = date => `${padding(date.getHours(), 2)}:${padding(date.getMinutes(), 2)}`

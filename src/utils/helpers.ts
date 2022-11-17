import bcrypt from 'bcrypt'
import { Redis } from 'ioredis'

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

export const genOrderNumber = () => {
  const dt = new Date()
  const year = dt.getFullYear() % 100
  const month = (dt.getMonth() + 1).toString().padStart(2, '0')
  const date = dt.getDate().toString().padStart(2, '0')
  return `ORD${year}${month}${date}${randomStr(6)}`
}

export class ColumnNumericTransformer {
  to(data: number): number {
    return data
  }
  from(data: string): number {
    return parseFloat(data)
  }
}

export const setCacheObjectToRedis = (
  redis: Redis,
  key: string,
  data: any,
  timeout?: number,
) => {
  redis.set(key, JSON.stringify(data), 'EX', timeout)
}

export const setCacheStringToRedis = (
  redis: Redis,
  key: string,
  data: string,
  timeout?: number,
) => {
  redis.set(key, data, 'EX', timeout)
}

export const getCacheObjectToRedis = async (redis: Redis, key: string) => {
  const value = await redis.get(key)
  return JSON.parse(JSON.parse(value))
}

export const getCacheStringToRedis = async (redis: Redis, key: string) => {
  return await redis.get(key)
}

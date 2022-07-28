import { getConnection } from 'typeorm'

export const truncates = (...tableNames: string[]) => {
  const query = tableNames.map(name => `TRUNCATE ${name} CASCADE;`).join('')
  return getConnection().query(query)
}

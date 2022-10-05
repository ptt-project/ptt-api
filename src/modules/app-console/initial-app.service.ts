import { Command, Console } from 'nestjs-console'
import { Connection, EntityManager, getConnection } from 'typeorm'
import { readFileSync } from 'fs'
import { AddressMaster } from 'src/db/entities/AddressMaster'

const ADDRESS_MASTER_PATH = '/app/config/master/address-data.json'
const BRAND_MASTER_PATH = '/app/config/master/brand-options.json'
const BANK_MASTER_PATH = '/app/config/master/bank-options.json'
const PLATFORM_CATEGORY_MASTER_PATH = '/app/config/master/plateform-category-options.json'

@Console()
export class InitialAppConsoleService {

  @Command({
    command: 'initial-app',
    description: 'load master data form file to db',
  })
  async initialApp() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    console.log('initialApp start')

    const addressData = readFileSync(ADDRESS_MASTER_PATH)
    const addressJson = JSON.parse(addressData.toString('utf-8'))
    console.log(addressJson)

    const addressMaster = etm.create(AddressMaster, {
      data: addressJson,
    })
    await etm.save(addressMaster)

    console.log('Address load successfully')
  }
}

import { Command, Console } from 'nestjs-console'
import { Connection, EntityManager, getConnection } from 'typeorm'
import { readFileSync } from 'fs'
import { AddressMaster } from 'src/db/entities/AddressMaster'
import { Brand } from 'src/db/entities/Brand'
import { Bank } from 'src/db/entities/Bank'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'
import { ImageSize } from '../image/type/image.type'
import { genUuid } from 'src/utils/helpers'
import { InjectWebDAV, WebDAV } from 'nestjs-webdav'
import sharp from 'sharp'
import { Image } from 'src/db/entities/Image'
import { truncates } from 'src/utils/db'

const ROOT_MASTER_PATH = '/app/config/master'
const ADDRESS_MASTER_PATH = '/app/config/master/address-data.json'
const BRAND_MASTER_PATH = '/app/config/master/brand-options.json'
const BANK_MASTER_PATH = '/app/config/master/bank-options.json'
const PLATFORM_CATEGORY_MASTER_PATH = '/app/config/master/plateform-category-options.json'

const imageSizes: Record<string, ImageSize> = {
  large: { width: 1920, height: 800 },
  medium: { width: 800, height: 800 },
  small: { width: 400, height: 400 },
  thumbnail: { width: 200, height: 200 },
}
@Console()
export class InitialAppConsoleService {
  constructor(
    @InjectWebDAV('nextCloud') private readonly nextCloud: WebDAV,
  ) {}

  @Command({
    command: 'clear-initial',
    description: 'clear initail data',
  })
  async clearData() {
    await truncates(
      'address_masters',
      'banks',
      'platform_categories',
      'brands',
    )
  }

 async resizeImage(imageOriginal: string, size: ImageSize) {
  let newImage: Buffer
    try {
      const imageBuffer = Buffer.from(imageOriginal, 'base64');
      newImage = await sharp(imageBuffer)
        .resize(size.width, size.height)
        .toBuffer()
    } catch (error) {
      return [newImage, error.message]
    }
    return [newImage, '']
 }

  async uploadImage(imageOriginal: string, etm: EntityManager) {
    const id = genUuid()
      const nameDir = '/Photos/' + id
      await this.nextCloud.createDirectory(nameDir)

      Object.entries(imageSizes).map(async ([key, value]) => {
        const [newImag, errorResizeImage] = await this.resizeImage(
          imageOriginal,
          value,
        )
        if (errorResizeImage != '') {
          console.log('errorResizeImage', errorResizeImage)
          return
        }

        await this.nextCloud.putFileContents(
          nameDir + `/${id}` + `_${key}.jpg`,
          newImag,
        )
        return newImag
      })

      this.nextCloud.putFileContents(
        nameDir + `/${id}_original.jpg`,
        imageOriginal,
      )

      const image = etm.create(Image, { id })
      etm.save(image)

      return id
  }

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

    const addressMaster = etm.create(AddressMaster, {
      data: addressJson,
    })
    await etm.save(addressMaster)
    console.log('Address load successfully')

    const bankFile = readFileSync(BANK_MASTER_PATH)
    const bankList = JSON.parse(bankFile.toString('utf-8'))

    const bankIconMap = {}
    for (const bank of bankList) {
      if (!(bank["ICON"] in bankIconMap)) {
        const image = readFileSync(ROOT_MASTER_PATH + bank["ICON"], {encoding: 'base64'});
        const imageId = await this.uploadImage(image, etm)
        bankIconMap[bank["ICON"]] = imageId
      }
    }

    const bankMaster = etm.create(Bank, bankList.map((bank => ({
      bankCode: bank["REFERENCE CODE"],
      nameTh: bank["FI_NAME_THAI"],
      nameEn: bank["FI_NAME_ENGLISH"],
      icon: bankIconMap[bank["ICON"]]
    }))))
    await etm.save(bankMaster)

    console.log('Banks load successfully')

    const brandData = readFileSync(BRAND_MASTER_PATH)
    const brandJson = JSON.parse(brandData.toString('utf-8'))

    const brandMaster = etm.create(Brand, brandJson.map((brand) => ({
      name: brand.name,
    })))
    await etm.save(brandMaster)
    console.log('Brands load successfully')

    const platFormCategoriesData = readFileSync(PLATFORM_CATEGORY_MASTER_PATH)
    const platformCategoriesJson = JSON.parse(platFormCategoriesData.toString('utf-8'))

    const platformCategoriesdMaster = etm.create(PlatformCategory, platformCategoriesJson.map((cat) => ({
      name: cat.name,
      status: cat.status,
    })))
    await etm.save(platformCategoriesdMaster)
    console.log('PlatformCategories load successfully')
  }
}

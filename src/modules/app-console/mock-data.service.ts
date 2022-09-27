import { Command, Console } from 'nestjs-console'
import { Connection, EntityManager, getConnection } from 'typeorm'
import { AuthService } from '../auth/auth.service'
import { RegisterRequestDto } from '../auth/dto/register.dto'
import { RegisterService } from '../seller/service/register.service'
import { InsertShopToDbParams } from '../seller/type/seller.type'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'
import { Brand } from 'src/db/entities/Brand'
import { truncates } from 'src/utils/db'
import { ProductService } from '../product/product.service'
import {
  InsertProductOptionsToDbParams,
  InsertProductProfileToDbParams,
  InsertProductsToDbParams,
} from '../product/product.type'

@Console()
export class MockDataConsoleService {
  constructor(
    private readonly authService: AuthService,
    private readonly regiserSellerService: RegisterService,
    private readonly productService: ProductService,
  ) {}

  @Command({
    command: 'test-create-parition',
    description: 'delete data from array',
  })
  async testCreatePartition() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    const r = await etm.query(`
      CREATE TABLE product_profile_shop_1 PARTITION OF product_profiles FOR VALUES IN (1);
    `)
  }

  @Command({
    command: 'clear-data',
    description: 'delete data from array',
  })
  async clearData() {
    await truncates(
      'members',
      'shops',
      'platform_categories',
      'brands',
      'product_profiles',
      'products',
      'product_options',
    )
  }

  @Command({
    command: 'mock-products',
    description: 'mock data for product',
  })
  async mockProducts() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    // const createUserParams: RegisterRequestDto = {
    //   firstName: 'firstname01',
    //   lastName: 'lastname01',
    //   email: 'test@gmail.com',
    //   mobile: '0812345678',
    //   username: 'testuser01',
    //   password: '1234567890',
    //   pdpaStatus: true,
    //   otpCode: '',
    //   refCode: '',
    // }
    // const [member, errorCreateUser] = await (
    //   await this.authService.insertMemberToDbFunc(etm)
    // )(createUserParams)
    // if (errorCreateUser != '') {
    //   return console.log('create user error =>', errorCreateUser)
    // }

    // const createShopParams: InsertShopToDbParams = {
    //   memberId: member.id,
    //   fullName: 'นายเอ นามสมมุติ',
    //   email: 'shop2@gmail.com',
    //   mobile: '0052896552',
    //   brandName: 'bestShop',
    //   category: 'util',
    //   website: 'www.myshop.com',
    //   facebookPage: 'www.facebock.com/myshop',
    //   instagram: '@myshop',
    //   socialMedia: '@myshop',
    //   note: '',
    //   corperateName: 's',
    //   corperateId: 's',
    //   type: 'Mall',
    // }
    // const [shop, insertShopToDbError] = await (
    //   await this.regiserSellerService.insertShopToDbFunc(etm)
    // )(createShopParams)
    // if (errorCreateUser != '') {
    //   return console.log('create shop error =>', insertShopToDbError)
    // }

    const platformCategory = etm.create(PlatformCategory, {
      name: 'platform-category01',
      status: 'active',
    })
    await etm.save(platformCategory)

    const brand = etm.create(Brand, {
      name: 'brand01',
    })
    await etm.save(brand)

    const createProductProfileParams: InsertProductProfileToDbParams = {
      name: 'product profile01',
      detail: 'product profile details',
      shopId: 1,
      platformCategoryId: platformCategory.id,
      brandId: brand.id,
      status: 'public',
      weight: 5.5,
      width: 20,
      length: 20,
      height: 20,
    }

    const [productProfile, insertProductProfileToDbError] = await (
      await this.productService.InsertProductProfileToDbFunc(etm)
    )(createProductProfileParams)
    if (insertProductProfileToDbError != '') {
      return console.log(
        'create product profile error =>',
        insertProductProfileToDbError,
      )
    }

    const createProductOptionsParams: InsertProductOptionsToDbParams[] = [
      {
        name: 'color',
        productProfileId: productProfile.id,
        options: ['red', 'black'],
      },
      {
        name: 'size',
        productProfileId: productProfile.id,
        options: ['small', 'large'],
      },
    ]

    const [productOptons, insertProductOptionsToDbError] = await (
      await this.productService.InsertProductOptionsToDbFunc(etm)
    )(createProductOptionsParams)
    if (insertProductOptionsToDbError != '') {
      return console.log(
        'create product options error =>',
        insertProductOptionsToDbError,
      )
    }

    const createProductsParams: InsertProductsToDbParams[] = [
      {
        productProfileId: productProfile.id,
        option1: 'red',
        option2: 'small',
        price: 100.0,
        stock: 10,
      },
      {
        productProfileId: productProfile.id,
        option1: 'red',
        option2: 'large',
        price: 200.0,
        stock: 10,
      },
      {
        productProfileId: productProfile.id,
        option1: 'black',
        option2: 'small',
        price: 100.0,
        stock: 10,
      },
      {
        productProfileId: productProfile.id,
        option1: 'black',
        option2: 'large',
        price: 200.0,
        stock: 10,
      },
    ]

    const [products, insertProductsToDbError] = await (
      await this.productService.InsertProductsToDbFunc(etm)
    )(createProductsParams)
    if (insertProductsToDbError != '') {
      return console.log(
        'create product options error =>',
        insertProductsToDbError,
      )
    }

    // console.log('user', member)
    // console.log('shop', shop)
    console.log('productProfile', productProfile)
    console.log('productOptons', productOptons)
    console.log('products', products)
  }
}

import { Command, Console } from 'nestjs-console'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { Connection, EntityManager, getConnection } from 'typeorm'
import { AuthService } from '../auth/auth.service'
import { RegisterRequestDto } from '../auth/dto/register.dto'
import { RegisterService } from '../seller/register.service'
import { InsertShopToDbParams } from '../seller/seller.type'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'
import { Brand } from 'src/db/entities/Brand'
import { Product } from 'src/db/entities/Product'
import { ProductOption } from 'src/db/entities/ProductOption'
import { truncates } from 'src/utils/db'

@Console()
export class MockDataConsoleService {
  constructor(
    private readonly authService: AuthService,
    private readonly regiserSellerService: RegisterService,
  ) {}

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

    const createUserParams: RegisterRequestDto = {
      firstName: 'firstname01',
      lastName: 'lastname01',
      email: 'test@gmail.com',
      mobile: '0812345678',
      username: 'testuser01',
      password: '1234567890',
      pdpaStatus: true,
      otpCode: '',
      refCode: '',
    }
    const [member, errorCreateUser] = await (
      await this.authService.insertMemberToDbFunc(etm)
    )(createUserParams)
    if (errorCreateUser != '') {
      return console.log('create user error =>', errorCreateUser)
    }

    const createShopParams: InsertShopToDbParams = {
      memberId: member.id,
      fullName: 'นายเอ นามสมมุติ',
      email: 'shop2@gmail.com',
      mobile: '0052896552',
      brandName: 'bestShop',
      category: 'util',
      website: 'www.myshop.com',
      facebookPage: 'www.facebock.com/myshop',
      instagram: '@myshop',
      socialMedia: '@myshop',
      note: '',
      corperateName: 's',
      corperateId: 's',
      type: 'Mall',
    }
    const [shop, insertShopToDbError] = await (
      await this.regiserSellerService.insertShopToDbFunc(etm)
    )(createShopParams)
    if (errorCreateUser != '') {
      return console.log('create shop error =>', insertShopToDbError)
    }

    const platformCategory = etm.create(PlatformCategory, {
      name: 'platform-category01',
      status: 'active',
      productCount: 2,
    })
    await etm.save(platformCategory)

    const brand = etm.create(Brand, {
      name: 'brand01',
    })
    await etm.save(brand)

    const productProfile = etm.create(ProductProfile, {
      name: 'product profile01',
      detail: 'product profile details',
      shopId: shop.id,
      platformCategoryId: platformCategory.id,
      brandId: brand.id,
      status: 'public',
      approval: true,
      weight: 5.5,
    })
    await etm.save(productProfile)

    const productOption = etm.create(ProductOption, {
      name: 'color',
      productProfileId: productProfile.id,
      options: ['red', 'black'],
    })
    await etm.save(productOption)

    const product01 = etm.create(Product, {
      sku: 'product-001',
      productProfileId: productProfile.id,
      shopId: shop.id,
      platformCategoryId: platformCategory.id,
      brandId: brand.id,
      option1: 'red',
      price: 100.0,
      stock: 10,
    })
    await etm.save(product01)

    const product02 = etm.create(Product, {
      sku: 'product-002',
      productProfileId: productProfile.id,
      shopId: shop.id,
      platformCategoryId: platformCategory.id,
      brandId: brand.id,
      option1: 'black',
      price: 100.0,
      stock: 10,
    })
    await etm.save(product02)

    console.log('user', member)
    console.log('shop', shop)
  }
}

import { Command, Console } from 'nestjs-console'
import { Connection, EntityManager, getConnection } from 'typeorm'
import { AuthService } from '../auth/auth.service'
import { RegisterRequestDto } from '../auth/dto/register.dto'
import { RegisterService } from '../seller/register.service'
import { InsertShopToDbParams } from '../seller/seller.type'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'
import { Brand } from 'src/db/entities/Brand'
import { truncates } from 'src/utils/db'
import { ProductService } from '../product/product.service'
import { InsertProductOptionsToDbParams, InsertProductProfileToDbParams, InsertProductsToDbParams } from '../product/product.type'
import { SellerFlashSaleService } from '../flash-sale/service/seller-flash-sale.service'
import { FlashSaleRound } from 'src/db/entities/FlashSaleRound'

@Console()
export class MockDataConsoleService {
  constructor(
    private readonly authService: AuthService,
    private readonly regiserSellerService: RegisterService,
    private readonly productService: ProductService,
    private readonly flashSaleService: SellerFlashSaleService,
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
      'flash_sale_product_profiles',
      'flash_sales',
      'flash_sale_rounds',
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
    })
    await etm.save(platformCategory)

    const brand = etm.create(Brand, {
      name: 'brand01',
    })
    await etm.save(brand)

    const createProductProfileParams: InsertProductProfileToDbParams = {
      name: 'product profile01',
      detail: 'product profile details',
      shopId: shop.id,
      platformCategoryId: platformCategory.id,
      brandId: brand.id,
      status: 'public',
      weight: 5.5,
      width: 20,
      length: 20,
      height: 20,
      minPrice: 100,
      maxPrice: 200,
    }

    const [productProfile, insertProductProfileToDbError] = await (
      await this.productService.InsertProductProfileToDbFunc(etm)
    )(createProductProfileParams)
    if (insertProductProfileToDbError != '') {
      return console.log('create product profile error =>', insertProductProfileToDbError)
    }

    const createProductOptionsParams: InsertProductOptionsToDbParams[] = [{
      name: 'color',
      productProfileId: productProfile.id,
      options: ['red', 'black'],
    }, {
      name: 'size',
      productProfileId: productProfile.id,
      options: ['small', 'large'],
    }]

    const [productOptons, insertProductOptionsToDbError] = await (
      await this.productService.InsertProductOptionsToDbFunc(etm)
    )(createProductOptionsParams)
    if (insertProductOptionsToDbError != '') {
      return console.log('create product options error =>', insertProductOptionsToDbError)
    }

    const createProductsParams: InsertProductsToDbParams[] = [{
      productProfileId: productProfile.id,
      option1: 'red',
      option2: 'small',
      price: 100.0,
      stock: 10,
      shop,
    }, {
      productProfileId: productProfile.id,
      option1: 'red',
      option2: 'large',
      price: 200.0,
      stock: 10,
      shop,
    }, {
      productProfileId: productProfile.id,
      option1: 'black',
      option2: 'small',
      price: 100.0,
      stock: 10,
      shop,
    }, {
      productProfileId: productProfile.id,
      option1: 'black',
      option2: 'large',
      price: 200.0,
      stock: 10,
      shop,
    }]

    const [products, insertProductsToDbError] = await (
      await this.productService.InsertProductsToDbFunc(etm)
    )(createProductsParams)
    if (insertProductsToDbError != '') {
      return console.log('create product options error =>', insertProductsToDbError)
    }

    let flashSaleRounds
    try {
      const now = new Date()
      const days = 15
      const rounds = [["00:00:00", "11:00:00"], ["11:00:00", "18:00:00"], ["18:00:00", "00:00:00"]]
      const genRounds = new Array(days).fill(0).reduce((mem, cur, i) => {
        const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + i}`
        const tomorrow = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + i + 1}`
        return [
          ...mem,
          ...rounds.map(date => ({
            date: new Date(`${today} 00:00:00.000+07:00`),
            startTime: new Date(`${today} ${date[0]}.000+07:00`),
            endTime: new Date(`${date[1] === "00:00:00" ? tomorrow : today} ${date[1]}.000+07:00`),
          })),
        ]
      }, [])
      flashSaleRounds = etm.create(FlashSaleRound, genRounds)
      flashSaleRounds = await etm.save(flashSaleRounds)
    } catch (error) {
      console.log(error.message)
    }

    const [flashSale, insertFlashSaleToDbError] = await (
      await this.flashSaleService.InsertFlashSaleFunc(etm)
    )(shop.id, {
      roundId: flashSaleRounds[0].id,
      status: "active",
      products: [
        {
          productId: products[0].id,
          discountType: "percentage",
          discount: 10,
          limitToStock: 5,
          limitToBuy: 1,
          isActive: true,
        }
      ]
    })
    if (insertFlashSaleToDbError != '') {
      return console.log('create flash sale error =>', insertFlashSaleToDbError)
    }

    console.log('user', member)
    console.log('shop', shop)
    console.log('productProfile', productProfile)
    console.log('productOptons', productOptons)
    console.log('products', products)
    console.log('flashSale', flashSale)
  }
}

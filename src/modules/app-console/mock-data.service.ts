import { Command, Console } from 'nestjs-console'
import { Connection, EntityManager, getConnection } from 'typeorm'
import { RegisterRequestDto } from '../auth/dto/register.dto'
import { RegisterService } from '../seller/service/register.service'
import { InsertShopToDbParams } from '../seller/type/seller.type'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'
import { Brand } from 'src/db/entities/Brand'
import { truncates } from 'src/utils/db'
import { ProductService } from '../product/service/product.service'
import {
  InsertProductOptionsToDbParams,
  InsertProductProfileToDbParams,
  InsertProductsToDbParams,
} from '../product/type/product.type'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { AuthService } from '../auth/service/auth.service'
import { WalletService } from '../wallet/service/wallet.service'
import { WalletTransaction } from 'src/db/entities/WalletTransaction'

@Console()
export class MockDataConsoleService {
  constructor(
    private readonly authService: AuthService,
    private readonly regiserSellerService: RegisterService,
    private readonly productService: ProductService,
    private readonly walletService: WalletService,
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
    command: 'query-product',
    description: 'test query product',
  })
  async queryProduct() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()
    const queryProductProfiles = etm
      .createQueryBuilder(ProductProfile, 'productProfiles')
      .innerJoin('productProfiles.products', 'products')

    const [
      productProfiles,
      countProductProfiles,
    ] = await queryProductProfiles.getManyAndCount()

    console.log('productProfiles count = ', countProductProfiles)
    console.log('productProfiles count = ', productProfiles)
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

    const [wallet, errorCreateWallet] = await (
      await this.walletService.InsertWalletToDbFunc(etm)
    )(member.id)
    if (errorCreateWallet != '') {
      return console.log('create wallet error =>', errorCreateWallet)
    }

    let walletTransactions = etm.create(WalletTransaction, [
      {
        walletId: wallet.id,
        status: 'success',
        amount: 100000.00,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
        note: 'credit',
      }, {
        walletId: wallet.id,
        status: 'fail',
        amount: 1000.00,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
        note: 'credit',
      }, {
        walletId: wallet.id,
        status: 'pending',
        amount: 1000.00,
        type: 'deposit',
        detail: 'ฝากเงินผ่านธนาคาร',
        note: 'credit',
      }, {
        walletId: wallet.id,
        status: 'success',
        amount: 1000.00,
        type: 'withdraw',
        detail: 'ถอนเงิน',
        note: 'debit',
      }, {
        walletId: wallet.id,
        status: 'success',
        amount: 1000.00,
        type: 'buy',
        detail: 'ซื้อสินค้า',
        note: 'debit',
      }, {
        walletId: wallet.id,
        status: 'success',
        amount: 1000.00,
        type: 'buy',
        detail: 'ซื้อสินค้า',
        note: 'debit',
      }, {
        walletId: wallet.id,
        status: 'success',
        amount: 1000.00,
        type: 'sell',
        detail: 'ขายสินค้า',
        note: 'credit',
      }, {
        walletId: wallet.id,
        status: 'success',
        amount: 1000.00,
        type: 'buy',
        detail: 'ซื้อสินค้า',
        note: 'debit',
      }, {
        walletId: wallet.id,
        status: 'cancel',
        amount: 1000.00,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
        note: 'credit',
      }, {
        walletId: wallet.id,
        status: 'success',
        amount: 2000.00,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
        note: 'credit',
      },, {
        walletId: wallet.id,
        status: 'success',
        amount: 5000.00,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
        note: 'credit',
      },
    ])
    walletTransactions = await etm.save(walletTransactions)

    wallet.balance = walletTransactions.reduce((balance, transaction) => {
      if (transaction.status === 'success')
        return (transaction.note === 'credit'
          ? balance + +transaction.amount
          : balance - +transaction.amount)
      return balance
    }, 0.0)
    etm.save(wallet)

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
    // const createUserParams: RegisterRequestDto = {
    //   firstName: 'firstname02',
    //   lastName: 'lastname01',
    //   email: 'test@gmail.com',
    //   mobile: '0812345678',
    //   username: 'testuser03',
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
    // console.log('user', member)

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
    // console.log('shop', shop)

    const shopId = 3

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
      shopId: shopId,
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
    console.log('productProfile', productProfile)

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

    console.log('createProductOptionsParams', createProductOptionsParams)
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

    console.log('productProfile', productProfile)
    console.log('productOptons', productOptons)
    console.log('products', products)
  }
}

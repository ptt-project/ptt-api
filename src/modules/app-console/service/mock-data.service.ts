import { Command, Console } from 'nestjs-console'
import { Connection, EntityManager, getConnection } from 'typeorm'
import { AuthService } from '../../auth/service/auth.service'
import { RegisterRequestDto } from '../../auth/dto/register.dto'
import { RegisterService } from '../../seller/service/register.service'
import { InsertShopToDbParams } from '../../seller/type/seller.type'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'
import { Brand } from 'src/db/entities/Brand'
import { truncates } from 'src/utils/db'
import { WalletService } from '../../wallet/service/wallet.service'
import { WalletTransaction } from 'src/db/entities/WalletTransaction'
import { ProductService } from '../../product/service/product.service'
import {
  InsertProductOptionsToDbParams,
  InsertProductProfileToDbParams,
  InsertProductsToDbParams,
} from '../../product/type/product.type'
import { genUuid } from 'src/utils/helpers'
import { MasterConfig, MasterConfigType } from 'src/db/entities/MasterConfig'
import { OtpService } from 'src/modules/otp/service/otp.service'
import { MobileService } from 'src/modules/mobile/service/mobile.service'
import { HappyPointService } from 'src/modules/happy-point/service/happy-point.service'
import { RegisterSellerRequestDto } from 'src/modules/seller/dto/seller.dto'
import { Member } from 'src/db/entities/Member'
import { Wallet } from 'src/db/entities/Wallet'
import { Shop } from 'src/db/entities/Shop'
import { ConditionService } from 'src/modules/shop/service/condition.service'

@Console()
export class MockDataConsoleService {
  constructor(
    private readonly authService: AuthService,
    private readonly regiserSellerService: RegisterService,
    private readonly walletService: WalletService,
    private readonly productService: ProductService,
    private readonly otpService: OtpService,
    private readonly mobileService: MobileService,
    private readonly happyPointService: HappyPointService,
    private readonly conditionService: ConditionService,
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
    command: 'create-master-config',
    description: 'create master config for app',
  })
  async createMasterConfig() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    const masterConfig = await etm.findOne(MasterConfig)

    if (masterConfig) {
      return
    }

    const masterConfigParams: MasterConfigType = {
      happyPointBuyRate: 1,
      happyPointSellRate: 1,
      happyPointTransferRate: 1,
      happyPointTransferPercentLimit: 50,
      happyPointFeePercent: 10,
      exchangeRate: 1,
      eWalletWithdrawFeeRate: 0.1,
    }

    const newMasterConfig = etm.create(MasterConfig, {
      config: masterConfigParams,
    })

    await etm.save(newMasterConfig)
    console.log('created master config', newMasterConfig.config)
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
    command: 'mock-member',
    description: 'mock data for product',
  })
  async mockMember() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    const body: RegisterRequestDto = {
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

    await this.authService.RegisterHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.authService.InquiryMemberExistFunc(etm),
      this.authService.ValidateInviteTokenFunc(etm),
      this.authService.InsertMemberToDbFunc(etm),
      this.mobileService.AddMobileFunc(etm),
      this.walletService.InsertWalletToDbFunc(etm),
      this.happyPointService.InsertHappyPointToDbFunc(etm),
    )(body, {})

    const member = await etm.findOne(Member, { order: { createdAt: 'DESC' } })

    const bodyRegisterSeller: RegisterSellerRequestDto = {
      fullName: 'นายเอ นามสมมุติ',
      email: 'shop4@gmail.com',
      mobile: '0052896550',
      brandName: 'bestShop',
      category: 'util',
      website: 'www.myshop.com',
      facebookPage: 'www.facebock.com/myshop',
      instagram: '@myshop',
      socialMedia: '@myshop',
      note: '',
      corperateName: 's',
      corperateId: 'ss2',
      type: 'Mall',
      mallApplicantRole: 'Exclusive Distributor',
    }
    await this.regiserSellerService.RegisterSellerHandler(
      this.regiserSellerService.ValidateSellerDataFunc(etm),
      this.regiserSellerService.InsertShopToDbFunc(etm),
      this.conditionService.InsertConditionToDbFunc(etm),
      this.regiserSellerService.CreateTablePartitionOfProductProfileToDbFunc(
        etm,
      ),
    )(member, bodyRegisterSeller)
  }

  @Command({
    command: 'mock-wallet-transaction',
    description: 'mock data for product',
  })
  async mockWalletTransaction() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    const wallet = await etm.findOne(Wallet, { order: { createdAt: 'DESC' } })
    const walletTransactions = etm.create(WalletTransaction, [
      {
        walletId: wallet.id,
        status: 'success',
        amount: 100000.0,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
      },
      {
        walletId: wallet.id,
        status: 'fail',
        amount: 1000.0,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
      },
      {
        walletId: wallet.id,
        status: 'pending',
        amount: 1000.0,
        type: 'deposit',
        detail: 'ฝากเงินผ่านธนาคาร',
      },
      {
        walletId: wallet.id,
        status: 'success',
        amount: -1000.0,
        type: 'withdraw',
        detail: 'ถอนเงิน',
      },
      {
        walletId: wallet.id,
        status: 'success',
        amount: -1000.0,
        type: 'buy',
        detail: 'ซื้อสินค้า',
      },
      {
        walletId: wallet.id,
        status: 'success',
        amount: -1000.0,
        type: 'buy',
        detail: 'ซื้อสินค้า',
      },
      {
        walletId: wallet.id,
        status: 'success',
        amount: 1000.0,
        type: 'sell',
        detail: 'ขายสินค้า',
      },
      {
        walletId: wallet.id,
        status: 'success',
        amount: -1000.0,
        type: 'buy',
        detail: 'ซื้อสินค้า',
      },
      {
        walletId: wallet.id,
        status: 'cancel',
        amount: 1000.0,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
      },
      {
        walletId: wallet.id,
        status: 'success',
        amount: 2000.0,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
      },
      ,
      {
        walletId: wallet.id,
        status: 'success',
        amount: 5000.0,
        type: 'deposit',
        detail: 'ฝากเงินผ่านเบอร์มือถือ',
      },
    ])
    await etm.save(walletTransactions)

    wallet.balance = walletTransactions.reduce((balance, transaction) => {
      if (transaction.status === 'success') return balance + +transaction.amount
      return balance
    }, 0.0)
    etm.save(wallet)
  }

  @Command({
    command: 'mock-products',
    description: 'mock data for product',
  })
  async mockProducts() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    const shop = await etm.findOne(Shop, { order: { createdAt: 'DESC' } })

    const platformCategory = etm.create(PlatformCategory, {
      nameEn: 'platform-category01',
      nameTh: 'ประเภทสินค้า01',
      status: 'active',
    })
    await etm.save(platformCategory)

    const brand = etm.create(Brand, {
      nameTh: 'brand01',
      nameEn: 'brand01',
    })
    await etm.save(brand)

    console.log('platformCategory.id', platformCategory.id)
    console.log('================================')

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
    }

    console.log('=== debug 1 ===', createProductProfileParams)

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
    // console.log('wallet', wallet)
    console.log('productProfile', productProfile)
    console.log('productOptons', productOptons)
    console.log('products', products)
  }
}

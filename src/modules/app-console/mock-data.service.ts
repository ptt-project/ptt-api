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

  @Command({
    command: 'mock-relations',
    description: 'mock data for relation',
  })
  async mockRelations() {
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()

    const createUserTemplateParams: RegisterRequestDto = {
      firstName: 'firstname',
      lastName: 'lastname',
      email: 'test@gmail.com',
      mobile: '0812345678',
      username: 'testuser01',
      password: '1234567890',
      pdpaStatus: true,
      otpCode: '',
      refCode: '',
    }
    const members = {
      username: 'test01', relations: [
        {
          username: 'test02', relations: [
            {
              username: 'test05', relations: [
                {
                  username: 'test11', relations: [],
                },
                {
                  username: 'test12', relations: [],
                },
              ],
            },
            {
              username: 'test06', relations: [],
            },
            {
              username: 'test07', relations: [],
            },
          ],
        },
        {
          username: 'test03', relations: [
            {
              username: 'test08', relations: [],
            },
            {
              username: 'test09', relations: [],
            },
          ],
        },
        {
          username: 'test04', relations: [
            {
              username: 'test10', relations: [
                {
                  username: 'test13', relations: [
                    {
                      username: 'test15', relations: [],
                    },
                    {
                      username: 'test16', relations: [],
                    },
                  ],
                },
                {
                  username: 'test14', relations: [],
                },
              ],
            },
          ],
        },
      ],
    }
    const insertMember = async (memberParams) => {
      const [member, errorCreateUser] = await (
        await this.authService.insertMemberToDbFunc(etm)
      )({
          ...createUserTemplateParams,
          username: memberParams.username,
          email: memberParams.username + 'gmail.com',
          firstName: memberParams.username + '_firstName',
          lastName: memberParams.username + '_lasstName'
        })
      if (errorCreateUser != '') {
        console.log('create user error =>', errorCreateUser)
      }
      return member
    }

    const createMember = async (memberData) => {
      if (memberData.relations.length === 0) {
        const member = await insertMember(memberData)
        if (member) {
          return member.id
        }
        
        return null
      }

      const relationIds = []
      for(const memberD of memberData.relations) {
        const memberId = await createMember(memberD)
        if (memberId) {
          relationIds.push(memberId)
        }
      }

      const member = await insertMember(memberData)
      if (member) {
        member.relationIds = relationIds
        await etm.save(member)
        return member.id
      }

      return null
    }

    console.log(await createMember(members))
  }
}
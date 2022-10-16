import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Shop } from 'src/db/entities/Shop'
import { response } from 'src/utils/response'
import { UnableToCreateFlashSaleError, UnableToDeleteFlashSaleError, UnableToUpdateFlashSaleError, ValidateFlashSaleError, UnableToGetFlashSaleRoundError, UnableToInquiryFlashSaleByIdError, UnableToInquiryFlashSaleError } from 'src/utils/response-code'
import { EntityManager, In, LessThan, MoreThanOrEqual, SelectQueryBuilder } from 'typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { DeleteFlashSaleFuncType, FilterFlashSaleParams, InquiryFlashSaleFuncType, InquiryFlashSaleByIdFuncType, InquiryFlashSaleRoundFuncType, InsertFlashSaleFuncType, InsertFlashSaleParams, RoundOptions, UpdateFlashSaleFuncType, ValidateFlashSaleFuncType } from '../type/seller-flash-sale.type'
import { FlashSale } from 'src/db/entities/FlashSale'
import { CreateFlashSaleRequestDTO, GetFlashSaleQueryDTO, GetFlashSaleRoundDTO, UpdateStatusFlashSaleRequestDTO } from '../dto/seller-flash-sale.dto'
import { FlashSaleRound } from 'src/db/entities/FlashSaleRound'
import { FlashSaleProduct } from 'src/db/entities/FlashSaleProduct'
import { getTimeFromDate } from 'src/utils/helpers'
import { Product } from 'src/db/entities/Product'

@Injectable()
export class SellerFlashSaleService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(SellerFlashSaleService.name)
  }
  GetShopFlashSaleRoundHandler(
    getFlashSaleRound: Promise<InquiryFlashSaleRoundFuncType>,
  ) {
    return async (query: GetFlashSaleRoundDTO) => {
      const start = dayjs()

      const [flashSaleRounds, getFlashSaleRoundError] = await (await getFlashSaleRound)(
        query.date,
      )

      if (getFlashSaleRoundError != '') {
        return response(undefined, UnableToGetFlashSaleRoundError, getFlashSaleRoundError)
      }

      this.logger.info(`Done GetShopFlashSaleRoundHandler ${dayjs().diff(start)} ms`)
      return response(flashSaleRounds)
    }
  }

  GetShopFlashSaleHandler(
    inquiryFlashSale: Promise<InquiryFlashSaleFuncType>,
  ) {
    return async (shop: Shop, query: GetFlashSaleQueryDTO) => {
      const start = dayjs()

      const { limit, page } = query
      const [flashSaleQuery, inquiryFlashSaleError] = await (await inquiryFlashSale)(
        shop.id,
        query,
      )

      if (inquiryFlashSaleError != '') {
        return response(undefined, UnableToInquiryFlashSaleError, inquiryFlashSaleError)
      }

      const result = await paginate<FlashSale>(flashSaleQuery, { limit, page })
      this.logger.info(`Done GetShopFlashSaleHandler ${dayjs().diff(start)} ms`)
      return response(result)
    }
  }

  GetShopFlashSaleByIdHandler(
    inquiryFlashSale: Promise<InquiryFlashSaleByIdFuncType>,
  ) {
    return async (shop: Shop, flashSaleId: number) => {
      const start = dayjs()

      const [flashSale, inquiryFlashSaleError] = await (await inquiryFlashSale)(
        shop.id,
        flashSaleId,
      )

      if (inquiryFlashSaleError != '') {
        return response(undefined, UnableToInquiryFlashSaleByIdError, inquiryFlashSaleError)
      }

      this.logger.info(`Done GetShopFlashSaleByIdHandler ${dayjs().diff(start)} ms`)
      return response(flashSale)
    }
  }

  CreateShopFlashSaleHandler(
    validate: Promise<ValidateFlashSaleFuncType>,
    createFlashSale: Promise<InsertFlashSaleFuncType>,
  ) {
    return async (shop: Shop, params: CreateFlashSaleRequestDTO) => {
      const start = dayjs()

      const [, validateError] = await (await validate)(
        shop.id,
        params,
      )

      if (validateError != '') {
        return response(undefined, ValidateFlashSaleError, validateError)
      }

      const [flashSale, createFlashSaleError] = await (await createFlashSale)(
        shop.id,
        params,
      )

      if (createFlashSaleError != '') {
        return response(undefined, UnableToCreateFlashSaleError, createFlashSaleError)
      }

      this.logger.info(`Done CreateShopFlashSaleHandler ${dayjs().diff(start)} ms`)
      return response(flashSale)
    }
  }

  UpdateShopFlashSaleHandler(
    validate: Promise<ValidateFlashSaleFuncType>,
    updateFlashSale: Promise<UpdateFlashSaleFuncType>,
  ) {
    return async (shop: Shop, params: CreateFlashSaleRequestDTO, flashSaleId: number) => {
      const start = dayjs()

      const [, validateError] = await (await validate)(
        shop.id,
        params,
        flashSaleId,
      )

      if (validateError != '') {
        return response(undefined, ValidateFlashSaleError, validateError)
      }

      const [flashSale, updateFlashSaleError] = await (await updateFlashSale)(
        shop.id,
        flashSaleId,
        params,
      )

      if (updateFlashSaleError != '') {
        return response(undefined, UnableToUpdateFlashSaleError, updateFlashSaleError)
      }

      this.logger.info(`Done UpdateShopFlashSaleHandler ${dayjs().diff(start)} ms`)
      return response(flashSale)
    }
  }

  DeleteShopFlashSaleHandler(
    deleteFlashSale: Promise<DeleteFlashSaleFuncType>,
  ) {
    return async (shop: Shop, flashSaleId: number) => {
      const start = dayjs()

      const [flashSale, deleteFlashSaleError] = await (await deleteFlashSale)(
        shop.id,
        flashSaleId,
      )

      if (deleteFlashSaleError != '') {
        return response(undefined, UnableToDeleteFlashSaleError, deleteFlashSaleError)
      }

      this.logger.info(`Done DeleteShopFlashSaleHandler ${dayjs().diff(start)} ms`)
      return response(flashSale)
    }
  }

  UpdateStatusShopFlashSaleHandler(
    inquiryFlashSale: Promise<InquiryFlashSaleByIdFuncType>,
    updateFlashSale: Promise<UpdateFlashSaleFuncType>
    ) {
      return async (shop: Shop, flashSaleId: number, body: UpdateStatusFlashSaleRequestDTO) => {
        const start = dayjs()

        const { status } = body
  
        const [flashSale, inquiryFlashSaleError] = await (await inquiryFlashSale)(
          shop.id,
          flashSaleId,
        )
  
        if (inquiryFlashSaleError != '') {
          return response(undefined, UnableToInquiryFlashSaleByIdError, inquiryFlashSaleError)
        }

        const [updatedFlashSale, updateFlashSaleError] = await (await updateFlashSale)(
          shop.id,
          flashSaleId,
          {
            ...flashSale,
            status,
          },
        )
  
        if (updateFlashSaleError != '') {
          return response(undefined, UnableToUpdateFlashSaleError, updateFlashSaleError)
        }
  
        this.logger.info(`Done UpdateStatusShopFlashSaleHandler ${dayjs().diff(start)} ms`)
        return response(updatedFlashSale)
      }
    }

  async InqueryFlashSaleRoundFunc(
    etm: EntityManager,
  ): Promise<InquiryFlashSaleRoundFuncType> {
    return async (date: Date): Promise<[RoundOptions[], string]> => {
      const start = dayjs()
      
      let flashSaleRound: FlashSaleRound[]

      try {
        flashSaleRound = await etm.find(FlashSaleRound, {
          where: {
            date,
            deletedAt: null
          },
          order: { 'startTime': 'ASC' },
        })

      } catch (error) {
        return [undefined, error.message]
      }
      
      this.logger.info(
        `Done InqueryFlashSaleRoundFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSaleRound.map((round) => ({
        value: round.id,
        label: `${getTimeFromDate(round.startTime)} - ${getTimeFromDate(round.endTime)}`
      })), '']
    }
  }

  async InqueryFlashSaleFunc(
    etm: EntityManager,
  ): Promise<InquiryFlashSaleFuncType> {
    return async (shopId: number, params: FilterFlashSaleParams): Promise<[SelectQueryBuilder<FlashSale>, string]> => {
      const start = dayjs()
      
      const { date, status } = params
      let flashSaleQuery: SelectQueryBuilder<FlashSale>

      try {
        flashSaleQuery = etm.createQueryBuilder(FlashSale, 'flashSale')
        flashSaleQuery
        .leftJoinAndSelect("flashSale.products", "flashSaleProduct")
        .leftJoinAndSelect("flashSaleProduct.product", "product")
        .leftJoinAndSelect("product.productProfile", "productProfile")
        .leftJoinAndSelect("flashSale.round", "flashSaleRound")
        const condition: any = { shopId, deletedAt: null, round: {} }
        console.log(date)
        if (date) {
          condition.round.date = date
        }
        if (status == 'active') {
          condition.round.date = MoreThanOrEqual(new Date())
        } else if (status == 'expired') {
          condition.round.date = LessThan(new Date())
        }
        flashSaleQuery.where(condition).orderBy({"flashSale.created_at": "ASC"})

      } catch (error) {
        return [flashSaleQuery, error.message]
      }
      
      this.logger.info(
        `Done InqueryFlashSaleFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSaleQuery, '']
    }
  }

  async ValidateFlashSaleFunc(
    etm: EntityManager,
  ): Promise<ValidateFlashSaleFuncType> {
    return async (shopId: number, params: InsertFlashSaleParams, flashSaleId?: number): Promise<[boolean, string]> => {
      const start = dayjs()
      
      const { products, roundId } = params

      try {

        const round :FlashSaleRound  = await etm.findOne(FlashSaleRound, {
          where: { 
            id: roundId,
            deletedAt: null,
          }
        })

        if (!round) {
          return [ false, 'Flash sale round is not found' ]
        }

        const now = new Date()

        if (round.startTime < now) {
          return [ false, 'Can not set flash sale to started round' ]
        }

        if (flashSaleId) {
          const flashSale: FlashSale = await etm.findOne(FlashSale, {
            where: { 
              id: flashSaleId,
              deletedAt: null,
            },
            relations: ['round']
          })

          if (!flashSale) {
            return [ false, 'Flash sale not found' ]
          }

          console.log(flashSale.round.startTime, now)

          if (flashSale.round.startTime < now) {
            return [ false, 'Can not update started flash sale' ]
          }
        }

      } catch (error) {
        return [ false, error.message ]
      }

      let discountError = ''
      products.forEach((product) => {
        if (product.discountType == 'percentage' && ( product.discount <= 0 || product.discount >= 100) ) {
          discountError = 'discount in percentage must be more than 0 and less than 100'
        } else if (product.discountType == 'value' && product.discount <= 0) {
          discountError = 'discount in value must be more than 0'
        }
      })
      if  (discountError) {
        return [false, discountError]
      }

      const productIds = products.map(product => product.productId)
      try {
        const productData = await etm.find(Product, {
          where: {
            id: In(productIds),
            shop: {
              id: shopId,
            },
            deletedAt: null,
          }
        })

        if (productData.length !== productIds.length) {
          return [false, `${productIds.length - productData.length} products are not found`]
        }
      } catch (error) {
        return [ false, error.message ]
      }
      
      this.logger.info(
        `Done ValidateFlashSaleFunc ${dayjs().diff(start)} ms`,
      )
      return [true, '']
    }
  }

  async InsertFlashSaleFunc(
    etm: EntityManager,
  ): Promise<InsertFlashSaleFuncType> {
    return async (shopId: number, params: InsertFlashSaleParams): Promise<[FlashSale, string]> => {
      const start = dayjs()
      let flashSale: FlashSale
      try {
        flashSale = etm.create(FlashSale, {
          roundId: params.roundId,
          shopId,
        })
        flashSale = await etm.save(flashSale)

        const products: Product[] = await etm.findByIds(
          Product,
          params.products.map(
            flashSaleProduct => flashSaleProduct.productId
          ),
          {
            where: {
              deletedAt: null,
            }
          }
        )

        if (products.length !== params.products.length) {
          return [null, 'Some of products are not found']
        }

        const productMap = products.reduce((mem, cur) => {
          return {...mem, [cur.id]: cur}
        }, {})

        const flashSaleProducts = etm.create( FlashSaleProduct, params.products.map(
          flashSaleProduct => ({
            productId: flashSaleProduct.productId,
            discountType: flashSaleProduct.discountType,
            discount: flashSaleProduct.discount,
            limitToBuy: flashSaleProduct.limitToBuy,
            limitToStock: flashSaleProduct.limitToStock,
            isActive: flashSaleProduct.isActive,
            flashSaleId: flashSale.id,
            price: flashSaleProduct.discountType === "percentage"
              ? productMap[flashSaleProduct.productId].price * ((100 - flashSaleProduct.discount) / 100)
              : productMap[flashSaleProduct.productId].price - flashSaleProduct.discount
          })
        ))
        await etm.save(flashSaleProducts)

      } catch (error) {
        return [null, error.message]
      }
      this.logger.info(
        `Done InsertFlashSaleFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSale, '']
    }
  }

  async UpdateFlashSaleFunc(
    etm: EntityManager,
  ): Promise<UpdateFlashSaleFuncType> {
    return async (shopId: number, flashSaleId: number, params: InsertFlashSaleParams): Promise<[FlashSale, string]> => {
      const start = dayjs()
      let flashSale: FlashSale
      try {
        flashSale = await etm.findOne(FlashSale, {
          id: flashSaleId,
          shopId,
        })

        if (!flashSale) {
          return [flashSale, "flash sale is not found"]
        }

        flashSale.roundId = params.roundId
        if (params.status) {
          flashSale.status = params.status
        }
        flashSale = await etm.save(flashSale)

        const products: Product[] = await etm.findByIds(
          Product,
          params.products.map(
            flashSaleProduct => flashSaleProduct.productId
          ),
          {
            where: {
              deletedAt: null,
            }
          }
        )

        if (products.length !== params.products.length) {
          return [null, 'Some of products are not found']
        }

        const productMap = products.reduce((mem, cur) => {
          return {...mem, [cur.id]: cur}
        }, {})

        const oldFlashSaleProduct = await etm.find(FlashSaleProduct, {
          where: {
            flashSaleId,
          }
        })
        await etm.softRemove(oldFlashSaleProduct)

        const flashSaleProducts = etm.create( FlashSaleProduct, params.products.map(
          flashSaleProduct => ({
            productId: flashSaleProduct.productId,
            discountType: flashSaleProduct.discountType,
            discount: flashSaleProduct.discount,
            isActive: flashSaleProduct.isActive,
            limitToBuy: flashSaleProduct.limitToBuy,
            limitToStock: flashSaleProduct.limitToStock,
            flashSaleId: flashSale.id,
            price: flashSaleProduct.discountType === "percentage"
              ? productMap[flashSaleProduct.productId].price * ((100 - flashSaleProduct.discount) / 100)
              : productMap[flashSaleProduct.productId].price - flashSaleProduct.discount
          })
        ))
        await etm.save(flashSaleProducts)

        flashSale = await etm.findOne(FlashSale, {
          where: {
            id: flashSaleId,
            shopId,
          },
          relations: ['products', 'products.product', 'products.product.productProfile']
        })

      } catch (error) {
        return [null, error.message]
      }
      this.logger.info(
        `Done UpdateFlashSaleFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSale, '']
    }
  }

  async DeleteFlashSaleFunc(
    etm: EntityManager,
  ): Promise<DeleteFlashSaleFuncType> {
    return async (shopId: number, flashSaleId: number): Promise<[FlashSale, string]> => {
      const start = dayjs()
      
      let flashSale: FlashSale

      try {
        flashSale = await etm.findOne(FlashSale, {
          where: {
            id: flashSaleId,
            shopId,
            deletedAt: null,
          }
        })

        if (!flashSale) {
          return [flashSale, `Flash Sale ${flashSaleId} is not found`]
        }

        const flashSaleProducts = await etm.find(FlashSaleProduct, {
          where: {
            flashSaleId,
            deletedAt: null,
          }
        })

        await etm.softRemove(flashSale)
        await etm.softRemove(flashSaleProducts)

      } catch (error) {
        return [flashSale, error.message]
      }
      
      this.logger.info(
        `Done DeleteFlashSaleFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSale, '']
    }
  }

  async InquiryFlashSaleByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryFlashSaleByIdFuncType> {
    return async (shopId: number, flashSaleId: number): Promise<[FlashSale, string]> => {
      const start = dayjs()
      
      let flashSale: FlashSale

      try {
        flashSale = await etm.findOne(FlashSale, {
          where: {
            id: flashSaleId,
            shopId,
            deletedAt: null,
          },
          relations: ['products', 'round', 'products.product', 'products.product.productProfile'],
        })

        console.log('flashSale', flashSale)

        if (!flashSale) {
          return [flashSale, `Flash Sale ${flashSaleId} is not found`]
        }

      } catch (error) {
        return [flashSale, error.message]
      }
      
      this.logger.info(
        `Done InquiryFlashSaleByIdFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSale, '']
    }
  }
}
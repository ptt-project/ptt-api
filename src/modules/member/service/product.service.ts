import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { PinoLogger } from "nestjs-pino";
import { paginate } from "nestjs-typeorm-paginate";
import { Member } from "src/db/entities/Member";
import { Product } from "src/db/entities/Product";
import { ProductProfile } from "src/db/entities/ProductProfile";
import { response } from "src/utils/response";
import { UnableInquiryProductByProductIds, UnableInquiryProductProfileByProductProfileId, UnableToGetProductPrice } from "src/utils/response-code";
import { EntityManager, LessThanOrEqual, MoreThan, SelectQueryBuilder } from "typeorm";
import { GetProductInfoMemberDto, GetProductListMemberDto } from "../dto/getProductList.dto";
import { InquiryMemberProductCurrentPriceFuncType, InquiryProductInfoByProductIdsType, InquiryProductListByShopIdType, ProductPrice } from "../type/product.type";

@Injectable()
export class ProductService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ProductService.name)
  }

  GetProductBuyerByShopIdHandler(
    inquiryProductProfileByShopId: Promise<InquiryProductListByShopIdType>,
    ) {
    return async (shopId: number, query: GetProductListMemberDto) => {
      const start = dayjs()
      const { limit = 10, page = 1 } = query

      const [productProfiles, inquiryProductProfileByShopIdError] = await (
        await inquiryProductProfileByShopId
      )(shopId, query)

      if (inquiryProductProfileByShopIdError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByShopIdError,
        )
      }

      this.logger.info(`Done GetProductBuyerByShopIdHandler ${dayjs().diff(start)} ms`)
      const result = await paginate<ProductProfile>(productProfiles, {
        limit,
        page,
      })
      return response(result)
    }
  }

  GetProductBuyerByProductIdsHandler(
    inquiryProductInfoByProductIds: Promise<InquiryProductInfoByProductIdsType>,
    inquiryMemberProductCurrentPrice: Promise<InquiryMemberProductCurrentPriceFuncType>,
    ) {
    return async (member: Member, query: GetProductInfoMemberDto) => {
      const start = dayjs()

      const [products, inquiryProductPInfoByProductIdsError] = await (
        await inquiryProductInfoByProductIds
      )(query)

      if (inquiryProductPInfoByProductIdsError != '') {
        return response(
          undefined,
          UnableInquiryProductByProductIds,
          inquiryProductPInfoByProductIdsError,
        )
      }

      const [productPrice, getCurrentProductPriceError] = await (
        await inquiryMemberProductCurrentPrice
      )(member, products)

      if (getCurrentProductPriceError != '') {
        return response(
          undefined,
          UnableToGetProductPrice,
          getCurrentProductPriceError,
        )
      }

      query.productIds.forEach((productId) => {
        if (!productPrice[productId]) {
          productPrice[productId] = {
            productId,
            status: 'not found',
          }
        }
      })

      this.logger.info(`Done GetProductBuyerByProductIdsHandler ${dayjs().diff(start)} ms`)
      return response(productPrice)
    }
  }
  
  async InquiryMemberProductCurrentPriceFunc(
    etm: EntityManager,
  ): Promise<InquiryMemberProductCurrentPriceFuncType> {
    return async (member: Member, products: Product[]): Promise<[Record<number, ProductPrice>, string]> => {

      const start = dayjs()
      let productPrice :Record<number, ProductPrice>

      // TODO: get with promotion and flash sale
      try {
        productPrice = products.reduce((mem, cur) => {
          return {
            ...mem,
            [cur.id]: {
              productId: cur.id,
              shopId: cur.productProfile.shop.id,
              shopName: cur.productProfile.shop.shopName,
              productName: cur.productProfile.name,
              imageIds: cur.productProfile.imageIds,
              option1: cur.option1,
              option2: cur.option2,
              price: cur.price,
              stock: cur.stock,
              status: 
                cur.deletedAt != null ||
                cur.productProfile.deletedAt != null ||
                cur.productProfile.status == 'hidden' ||
                !cur.productProfile.approval ||
                cur.productProfile.shop.deletedAt != null ||
                cur.productProfile.shop.approvalStatus != 'approved'
                ? 'unavailable'
                : 'available',
            }
          }
        }, {})

          
      } catch (error) {
        return [productPrice, error.message]
      }

      this.logger.info(
        `Done InquiryMemberProductCurrentPriceFunc ${dayjs().diff(start)} ms`,
      )

      return [productPrice, '']
    }
  }

  async InquiryProductInfoByProductIdsFunc(
    etm: EntityManager,
  ): Promise<InquiryProductInfoByProductIdsType> {
    return async (query: GetProductInfoMemberDto): Promise<[Product[], string]> => {

      const start = dayjs()
      const { productIds } = query
      let products: Product[]

      // TODO: get with promotion and flash sale
      try {
        products = await etm.findByIds(Product, productIds, {
          relations: [
            "productProfile",
            "productProfile.shop",
          ],
        })

      } catch (error) {
        return [products, error.message]
      }

      this.logger.info(
        `Done InquiryProductInfoByProductIdsFunc ${dayjs().diff(start)} ms`,
      )

      return [products, '']
    }
  }

  async InquiryProductListByShopIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductListByShopIdType> {
    return async (shopId: number, query: GetProductListMemberDto): Promise<[SelectQueryBuilder<ProductProfile>, string]> => {

      const start = dayjs()
      let productProfiles: SelectQueryBuilder<ProductProfile>

      const partitionQuery: string = `product_profile_shop_${shopId}`

      try {
        productProfiles = etm
          .createQueryBuilder(ProductProfile, partitionQuery)
          .innerJoin(
            `${partitionQuery}.products`,
            'products',
          )

          if (query.categoryId) {
            productProfiles.innerJoin(
              'category_product_profiles',
              'category_product_profiles',
              `${partitionQuery}.id = category_product_profiles.product_profile_id and category_id = :categoryId`, {
                categoryId: query.categoryId,
            }
            )
          }
          
          productProfiles.where(`${partitionQuery}.deletedAt IS NULL`)
          .andWhere(`${partitionQuery}.shopId = :shopId`, {
            shopId,
          })
          if(query.keyword) {
            productProfiles.andWhere(`${partitionQuery}.name ILIKE :keyword or ${partitionQuery}.detail ILIKE :keyword`, {
              keyword: '%'+query.keyword+'%',
            })
          }
          productProfiles.orderBy(`${partitionQuery}.id`, 'ASC')
          productProfiles.addOrderBy('products.id', 'ASC')
          productProfiles.select([partitionQuery,'products'])

          
      } catch (error) {
        return [productProfiles, error]
      }

      this.logger.info(
        `Done InquiryProductListByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      return [productProfiles, '']
    }
  }
}
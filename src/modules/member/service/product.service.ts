import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { PinoLogger } from "nestjs-pino";
import { paginate } from "nestjs-typeorm-paginate";
import { ProductProfile } from "src/db/entities/ProductProfile";
import { response } from "src/utils/response";
import { UnableInquiryProductProfileByProductProfileId } from "src/utils/response-code";
import { EntityManager, SelectQueryBuilder } from "typeorm";
import { GetProductListMemberDto } from "../dto/getProductList.dto";
import { InquiryProductListByShopIdType } from "../type/product.type";

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

  async InquiryProductListByShopIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductListByShopIdType> {
    return async (shopId: number, query: GetProductListMemberDto): Promise<[SelectQueryBuilder<ProductProfile>, string]> => {

      const start = dayjs()
      let productProfiles: SelectQueryBuilder<ProductProfile>

      try {
        productProfiles = etm
          .createQueryBuilder(ProductProfile, 'productProfiles')
          .innerJoin(
            'productProfiles.products',
            'products',
          )
          .where('productProfiles.deletedAt IS NULL')
          .andWhere('productProfiles.shopId = :shopId', {
            shopId,
          })
          if(query.keyword) {
            productProfiles.andWhere('productProfiles.name ILIKE :keyword or productProfiles.detail ILIKE :keyword', {
              keyword: '%'+query.keyword+'%',
            })
          }

          if (query.categoryId) {
            productProfiles.andWhere('productProfiles.id = (select category_product_profiles.product_profile_id from category_product_profiles where productProfiles.id = category_product_profiles.product_profile_id and category_id = :categoryId)', {
                categoryId: query.categoryId,
            })
          }
          
          productProfiles.select(['productProfiles','products'])
          productProfiles.orderBy('productProfiles.id', 'ASC')
          productProfiles.addOrderBy('products.id', 'ASC')
          
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
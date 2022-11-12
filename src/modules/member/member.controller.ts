import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { RedisService } from 'nestjs-redis'
import { HappyPoint } from 'src/db/entities/HappyPoint'
import { Member } from 'src/db/entities/Member'
import { Wallet } from 'src/db/entities/Wallet'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqHappyPoint, ReqUser, ReqWallet } from '../auth/auth.decorator'
import { MemberEmailService } from './service/email.service'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { LookupService } from '../happy-point/service/lookup.service'
import { OtpService } from '../otp/service/otp.service'
import { WalletService } from '../wallet/service/wallet.service'
import { ChagnePasswordRequestDto } from './dto/password.dto'
import { EditEmailRequestDto } from './dto/editEmail.dto'
import { GetRelationRequestDto } from './dto/relation.dto'
import { RelationService } from './service/relation.service'
import {
  GetProductInfoMemberDto,
  GetProductListMemberDto,
} from './dto/getProductList.dto'
import { SearchMemberByUsernameDto } from './dto/search.dto'
import { UpdateProfiledRequestDto } from './dto/updateProfile.dto'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'
import { ProductService } from './service/product.service'

@Auth()
@Controller('v1/members')
export class MemberController {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly memberService: MemberService,
    private readonly relationService: RelationService,
    private readonly emailService: MemberEmailService,
    private readonly productService: ProductService,
    private readonly lookupService: LookupService,
    private readonly happyService: HappyPointService,
    private readonly otpService: OtpService,
    private readonly walletService: WalletService,
    private readonly redisService: RedisService,
  ) {}

  @Patch('change-password')
  async changePassword(
    @ReqUser() member: Member,
    @Body() body: ChagnePasswordRequestDto,
  ) {
    return await this.passwordService.ChangePasswordHandler(
      this.passwordService.VadlidateOldPasswordFunc(),
      this.passwordService.UpdatePasswordToMemberFunc(),
    )(member, body)
  }

  @Get('profile')
  async getProfile(@ReqUser() member: Member) {
    return this.memberService.getProfileHandler(
      this.memberService.getProfileFunc(),
    )(member)
  }

  @Patch('edit-email')
  @Transaction()
  async editEmail(
    @ReqUser() member: Member,
    @Body() body: EditEmailRequestDto,
    @TransactionManager() manager: EntityManager,
  ) {
    return await this.emailService.editEmailHandler(
      this.emailService.vadlidatePasswordFunc(),
      this.emailService.vadlidateEmailFunc(),
      this.emailService.updateEmailToMemberFunc(),
      this.emailService.notifyNewEmailFunc(),
    )(member, body, manager)
  }

  @Put('profile')
  @Transaction()
  async updateProfile(
    @ReqUser() member: Member,
    @Body() body: UpdateProfiledRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.updateProfileHandler(
      this.memberService.updateProfileToMemberFunc(etm),
      this.memberService.InquiryUserExistByMemberIdFunc(etm),
    )(member, body)
  }

  @Get('relations')
  @Transaction()
  async getRelation(
    @ReqUser() member: Member,
    @Query() query: GetRelationRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.relationService.GetRelationHandler(
      this.relationService.InquiryMemberRelationFunc(etm),
    )(member, query)
  }

  @Get('products/infos')
  @Transaction()
  async getProductInfos(
    @ReqUser() member: Member,
    @Query() query: GetProductInfoMemberDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.GetProductBuyerByProductIdsHandler(
      this.productService.InquiryProductInfoByProductIdsFunc(etm),
      this.productService.InquiryMemberProductCurrentPriceFunc(etm),
    )(member, query)
  }

  @Auth()
  @Get('products/:shopId')
  @Transaction()
  async getProductListByShopId(
    @Param('shopId') shopId: string,
    @Query() query: GetProductListMemberDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.GetProductBuyerByShopIdHandler(
      this.productService.InquiryProductListByShopIdFunc(etm),
    )(shopId, query)
  }

  @Get('search')
  @Transaction()
  async searchMemberByUsername(
    @Query() query: SearchMemberByUsernameDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.SearchUserByUsernameHandler(
      this.memberService.InquiryMemberByUsernameFunc(etm),
    )(query)
  }
}

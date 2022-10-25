import { Body, Controller, Get, Param, Patch, Put, Query } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import { EditEmailRequestDto } from './dto/editEmail.dto'
import { GetRelationRequestDto } from './dto/relation.dto'
import { RelationService } from './service/relation.service'
import { GetProductListMemberDto } from './dto/getProductList.dto'
import { UpdateProfiledRequestDto } from './dto/updateProfile.dto'
import { EmailService } from './service/email.service'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'
import { ProductService } from './service/product.service'

@Controller('v1/members')
export class MemberController {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly memberService: MemberService,
    private readonly emailService: EmailService,
    private readonly relationService: RelationService,
    private readonly productService: ProductService,
  ) {}

  @Auth()
  @Patch('change-password')
  async changePassword(
    @ReqUser() member: Member,
    @Body() body: ChagnePasswordRequestDto,
  ) {
    return await this.passwordService.changePasswordHandler(
      this.passwordService.vadlidateOldPasswordFunc(),
      this.passwordService.updatePasswordToMemberFunc(),
    )(member, body)
  }

  @Auth()
  @Get('profile')
  async getProfile(@ReqUser() member: Member) {
    return this.memberService.getProfileHandler(
      this.memberService.getProfileFunc(),
    )(member)
  }

  @Auth()
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

  @Auth()
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

  @Auth()
  @Get('relations')
  @Transaction()
  async getRelation(
    @ReqUser() member: Member,
    @Query() query: GetRelationRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.relationService.getRelationHandler(
      this.relationService.InquiryMemberRelationFunc(etm),
    )(member, query)
  }

  @Auth()
  @Get('products/:shopId')
  @Transaction()
  async getProductListByShopId(
    @Param('shopId') shopId: number,
    @Query() query: GetProductListMemberDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.productService.GetProductBuyerByShopIdHandler(
      this.productService.InquiryProductListByShopIdFunc(etm),
    )(shopId, query)
  }
}

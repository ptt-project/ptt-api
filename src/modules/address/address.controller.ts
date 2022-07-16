import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'

import { MemberService } from './member.service'
import {
  CreateAddressRequestDto,
  MemberUpdateAddressRequestDto,
} from './dto/address.dto'

@Auth()
@Controller('v1/members/addresses')
export class AddressController {
  constructor(private readonly memberService: MemberService) {}

  @Post('')
  @Transaction()
  async createAddress(
    @ReqUser() member: Member,
    @Body() body: CreateAddressRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.createAddressHandler(
      this.memberService.UpdateNotMainAddressesByMemberIdToDbFunc(etm),
      this.memberService.UpdateNotPickupAddressesByMemberIdToDbFunc(etm),
      this.memberService.UpdateNotReturnItemAddressesByMemberIdToDbFunc(etm),
      this.memberService.InsertAddressToDbFunc(etm),
    )(member, body)
  }

  @Put(':addressId')
  @Transaction()
  async updateAddress(
    @Param('addressId') addressId: number,
    @ReqUser() member: Member,
    @Body() body: MemberUpdateAddressRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.updateAddressHandler(
      this.memberService.InquiryAddressByIdFunc(etm),
      this.memberService.UpdateNotMainAddressesByMemberIdToDbFunc(etm),
      this.memberService.UpdateNotPickupAddressesByMemberIdToDbFunc(etm),
      this.memberService.UpdateNotReturnItemAddressesByMemberIdToDbFunc(etm),
      this.memberService.UpdateAddressByIdToDbFunc(etm),
    )(member, addressId, body)
  }

  @Patch(':addressId/set-main')
  @Transaction()
  async setMainToAddress(
    @Param('addressId') addressId: number,
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.setMainAddressHandler(
      this.memberService.UpdateNotMainAddressesByMemberIdToDbFunc(etm),
      this.memberService.UpdateIsMainAddressesByIdToDbFunc(etm),
    )(member, addressId)
  }

  @Delete(':addressId')
  @Transaction()
  async deleteAddress(
    @Param('addressId') addressId: number,
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.deleteAddressHandler(
      this.memberService.InquiryAddressByIdFunc(etm),
      this.memberService.DeleteAddressByIdToDbFunc(etm),
    )(member, addressId)
  }

  @Get(':addressId')
  @Transaction()
  async getAdress(
    @Param('addressId') addressId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.getAddressHandler(
      this.memberService.InquiryAddressByIdFunc(etm),
    )(addressId)
  }

  @Get()
  @Transaction()
  async getAdressesByMemberId(
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.getAddressesByMemberIdHandler(
      this.memberService.InquiryAddressesByMemberIdFunc(etm),
    )(member)
  }
}

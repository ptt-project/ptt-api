import { Injectable } from '@nestjs/common'
import { Address } from 'src/db/entities/Address'
import { Member, MemberRoleType } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'
import {
  CreateAddressRequestDto,
  MemberUpdateAddressRequestDto,
} from './dto/address.dto'

import {
  UnableDeleteAddressById,
  UnableInquiryAddressById,
  UnableInsertAddressToDb,
  UnableInquiryAddressesByMemberId,
  UnableUpdateAddressToDb,
  UnableUpdateIsMainAddressById,
  UnableUpdateNotMainAddressByMemberId,
  UnableUpdatePickupAddressByMemberId,
  UnableUpdateReturnItemAddressByMemberId,
} from 'src/utils/response-code'

import {
  InsertAddressToDbParams,
  UpdateAddressToDbParams,
  InsertAddressToDbType,
  UpdateNotMainAddressesByMemberIdType,
  UpdateAddressByIdType,
  DeleteAddressByIdInDbType,
  UpdateIsMainAddressesByIdToDbType,
  InquiryAddressByIdType,
  InquiryAddressesByMemberIdType,
  UpdateNotPickupAddressesByMemberIdType,
  UpdateNotReturnItemAddressesByMemberIdType,
} from './member.type'

@Injectable()
export class MemberService {
  createAddressHandler(
    updateNotMainAddressByMemberId: Promise<
      UpdateNotMainAddressesByMemberIdType
    >,
    updateNotPickupAddressByMemberId: Promise<
      UpdateNotPickupAddressesByMemberIdType
    >,
    updateNotReturnItemAddressByMemberId: Promise<
      UpdateNotReturnItemAddressesByMemberIdType
    >,
    insertAddressToDb: Promise<InsertAddressToDbType>,
  ) {
    return async (member: Member, body: CreateAddressRequestDto) => {
      const { id: memberId, role } = member
      const { isMain, isPickup, isReturnItem } = body

      if (isMain) {
        const isErrorUpdate = await (await updateNotMainAddressByMemberId)(
          memberId,
        )

        if (isErrorUpdate != '') {
          return response(
            undefined,
            UnableUpdateNotMainAddressByMemberId,
            isErrorUpdate,
          )
        }
      }

      if (isPickup) {
        const isErrorUpdate = await (await updateNotPickupAddressByMemberId)(
          memberId,
          role,
        )

        if (isErrorUpdate != '') {
          return response(
            undefined,
            UnableUpdatePickupAddressByMemberId,
            isErrorUpdate,
          )
        }
      }

      if (isReturnItem) {
        const isErrorUpdate = await (
          await updateNotReturnItemAddressByMemberId
        )(memberId, role)

        if (isErrorUpdate != '') {
          return response(
            undefined,
            UnableUpdateReturnItemAddressByMemberId,
            isErrorUpdate,
          )
        }
      }

      const params: InsertAddressToDbParams = {
        ...body,
        memberId,
      }
      const [address, insertAddressToDbError] = await (await insertAddressToDb)(
        params,
      )

      if (insertAddressToDbError != '') {
        return response(
          undefined,
          UnableInsertAddressToDb,
          insertAddressToDbError,
        )
      }

      return response(address)
    }
  }

  async InsertAddressToDbFunc(
    etm: EntityManager,
  ): Promise<InsertAddressToDbType> {
    return async (
      params: InsertAddressToDbParams,
    ): Promise<[Address, string]> => {
      let address: Address

      try {
        address = await Address.create({ ...params })
        await etm.save(address)
      } catch (error) {
        return [address, error]
      }

      return [address, '']
    }
  }

  updateAddressHandler(
    inquiryAddressById: Promise<InquiryAddressByIdType>,
    updateNotMainAddressByMemberId: Promise<
      UpdateNotMainAddressesByMemberIdType
    >,
    updateNotPickupAddressByMemberId: Promise<
      UpdateNotPickupAddressesByMemberIdType
    >,
    updateNotReturnItemAddressByMemberId: Promise<
      UpdateNotReturnItemAddressesByMemberIdType
    >,
    updateAddressByIdToDb: Promise<UpdateAddressByIdType>,
  ) {
    return async (
      member: Member,
      addressId: number,
      body: MemberUpdateAddressRequestDto,
    ) => {
      const { id: memberId, role } = member
      const { isMain, isPickup, isReturnItem } = body

      const [address, inquiryAddressByIdError] = await (
        await inquiryAddressById
      )(addressId)

      if (inquiryAddressByIdError != '') {
        return response(
          undefined,
          UnableInquiryAddressById,
          inquiryAddressByIdError,
        )
      }

      if (address.isMain && isMain === false) {
        return response(
          undefined,
          UnableUpdateNotMainAddressByMemberId,
          "This address flag isMain true, Can't update isMain to false",
        )
      }

      if (isMain) {
        const isErrorUpdate = await (await updateNotMainAddressByMemberId)(
          memberId,
        )

        if (isErrorUpdate != '') {
          return response(
            undefined,
            UnableUpdateNotMainAddressByMemberId,
            isErrorUpdate,
          )
        }
      }

      if (address.isPickup && isPickup === false) {
        return response(
          undefined,
          UnableUpdatePickupAddressByMemberId,
          "This address flag isPickup true, Can't update isPickup to false",
        )
      }

      if (isPickup) {
        const isErrorUpdate = await (await updateNotPickupAddressByMemberId)(
          memberId,
          role,
        )

        if (isErrorUpdate != '') {
          return response(
            undefined,
            UnableUpdatePickupAddressByMemberId,
            isErrorUpdate,
          )
        }
      }

      if (address.isReturnItem && isReturnItem === false) {
        return response(
          undefined,
          UnableUpdateReturnItemAddressByMemberId,
          "This address flag isReturnItem true, Can't update isReturnItem to false",
        )
      }

      if (isReturnItem) {
        const isErrorUpdate = await (
          await updateNotReturnItemAddressByMemberId
        )(memberId, role)

        if (isErrorUpdate != '') {
          return response(
            undefined,
            UnableUpdateReturnItemAddressByMemberId,
            isErrorUpdate,
          )
        }
      }

      const params: UpdateAddressToDbParams = {
        ...body,
        memberId,
      }
      const updateAddressByIdToDbError = await (await updateAddressByIdToDb)(
        addressId,
        params,
      )

      if (updateAddressByIdToDbError != '') {
        return response(
          undefined,
          UnableUpdateAddressToDb,
          updateAddressByIdToDbError,
        )
      }

      return response(undefined)
    }
  }

  async UpdateAddressByIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateAddressByIdType> {
    return async (
      addressId: number,
      params: UpdateAddressToDbParams,
    ): Promise<string> => {
      try {
        await etm.getRepository(Address).update(addressId, { ...params })
      } catch (error) {
        return error
      }

      return ''
    }
  }

  setMainAddressHandler(
    updateNotMainAddressByMemberId: Promise<
      UpdateNotMainAddressesByMemberIdType
    >,
    updateIdMainAddressByIdToDb: Promise<UpdateIsMainAddressesByIdToDbType>,
  ) {
    return async (member: Member, addressId: number) => {
      const { id: memberId } = member

      const isErrorUpdate = await (await updateNotMainAddressByMemberId)(
        memberId,
      )

      if (isErrorUpdate != '') {
        return response(
          undefined,
          UnableUpdateNotMainAddressByMemberId,
          isErrorUpdate,
        )
      }

      const updateIdMainAddressByIdToDbError = await (
        await updateIdMainAddressByIdToDb
      )(addressId)

      if (updateIdMainAddressByIdToDbError != '') {
        return response(
          undefined,
          UnableUpdateIsMainAddressById,
          updateIdMainAddressByIdToDbError,
        )
      }

      return response(undefined)
    }
  }

  async UpdateIsMainAddressesByIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateIsMainAddressesByIdToDbType> {
    return async (addressId: number): Promise<string> => {
      try {
        await etm.getRepository(Address).update(addressId, { isMain: true })
      } catch (error) {
        return error
      }

      return ''
    }
  }

  async UpdateNotMainAddressesByMemberIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateNotMainAddressesByMemberIdType> {
    return async (memberId: number): Promise<string> => {
      try {
        await etm.getRepository(Address).update({ memberId }, { isMain: false })
      } catch (error) {
        return error
      }

      return ''
    }
  }

  async UpdateNotPickupAddressesByMemberIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateNotPickupAddressesByMemberIdType> {
    return async (memberId: number, role: MemberRoleType): Promise<string> => {
      if (role !== 'Seller') {
        return "Forbidden can't update isPickup"
      }

      try {
        await etm
          .getRepository(Address)
          .update({ memberId }, { isPickup: false })
      } catch (error) {
        return error
      }

      return ''
    }
  }

  async UpdateNotReturnItemAddressesByMemberIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateNotReturnItemAddressesByMemberIdType> {
    return async (memberId: number, role: MemberRoleType): Promise<string> => {
      if (role !== 'Seller') {
        return "Forbidden can't update isReturnItem"
      }
      try {
        await etm
          .getRepository(Address)
          .update({ memberId }, { isReturnItem: false })
      } catch (error) {
        return error
      }

      return ''
    }
  }

  deleteAddressHandler(
    inquiryAddressById: Promise<InquiryAddressByIdType>,
    deleteAddressByIdToDb: Promise<DeleteAddressByIdInDbType>,
  ) {
    return async (member: Member, addressId: number) => {
      const { role } = member
      const [address, inquiryAddressByIdError] = await (
        await inquiryAddressById
      )(addressId)

      if (inquiryAddressByIdError != '') {
        return response(
          undefined,
          UnableInquiryAddressById,
          inquiryAddressByIdError,
        )
      }

      const deleteAddressByIdToDbError = await (await deleteAddressByIdToDb)(
        address,
        role,
      )

      if (deleteAddressByIdToDbError != '') {
        return response(
          undefined,
          UnableDeleteAddressById,
          deleteAddressByIdToDbError,
        )
      }

      return response({ id: address })
    }
  }

  async DeleteAddressByIdToDbFunc(
    etm: EntityManager,
  ): Promise<DeleteAddressByIdInDbType> {
    return async (address: Address, role: MemberRoleType): Promise<string> => {
      const { isMain, isPickup, isReturnItem } = address
      if (isMain) {
        return "Can't delete address flag isMain true"
      } else if (isPickup) {
        if (role != 'Seller') {
          return "Forbidden can't delete flag isPickup true"
        } else {
          return "Can't delete address flag isPickup true"
        }
      } else if (isReturnItem) {
        if (role != 'Seller') {
          return "Forbidden can't delete flag isReturnItem true"
        } else {
          return "Can't delete address flag isReturnItem true"
        }
      }

      try {
        await etm.softRemove(address)
      } catch (error) {
        return error
      }

      return ''
    }
  }

  getAddressHandler(inquiryAddressById: Promise<InquiryAddressByIdType>) {
    return async (addressId: number) => {
      const [address, inquiryAddressByIdError] = await (
        await inquiryAddressById
      )(addressId)

      if (inquiryAddressByIdError != '') {
        return response(
          undefined,
          UnableInquiryAddressById,
          inquiryAddressByIdError,
        )
      }

      return response(address)
    }
  }

  async InquiryAddressByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryAddressByIdType> {
    return async (addressId: number): Promise<[Address, string]> => {
      let address: Address
      try {
        address = await etm
          .getRepository(Address)
          .findOne(addressId, { withDeleted: false })
      } catch (error) {
        return [address, error]
      }

      if (!address) {
        return [address, 'Not found Address']
      }

      return [address, '']
    }
  }

  getAddressesByMemberIdHandler(
    inquiryAddressesByMemberId: Promise<InquiryAddressesByMemberIdType>,
  ) {
    return async (member: Member) => {
      const { id: memberId } = member

      const [address, inquiryAddressesByMemberIdError] = await (
        await inquiryAddressesByMemberId
      )(memberId)

      if (inquiryAddressesByMemberIdError != '') {
        response(
          undefined,
          UnableInquiryAddressesByMemberId,
          inquiryAddressesByMemberIdError,
        )
      }

      return response(address)
    }
  }

  async InquiryAddressesByMemberIdFunc(
    etm: EntityManager,
  ): Promise<InquiryAddressesByMemberIdType> {
    return async (memberId: number): Promise<[Address[], string]> => {
      let address: Address[]
      try {
        address = await etm
          .getRepository(Address)
          .find({ withDeleted: false, where: { memberId } })
      } catch (error) {
        return [address, error]
      }

      return [address, '']
    }
  }
}

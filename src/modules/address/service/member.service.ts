import { Injectable } from '@nestjs/common'
import { Address } from 'src/db/entities/Address'
import { Member, MemberRoleType } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'
import {
  CreateAddressRequestDto,
  MemberUpdateAddressRequestDto,
} from '../dto/address.dto'

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
} from '../type/member.type'

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
        address = await etm.create(Address, { ...params })
        await etm.save(address)
      } catch (error) {
        return [address, error.message]
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
      addressId: string,
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
      addressId: string,
      params: UpdateAddressToDbParams,
    ): Promise<string> => {
      try {
        const geoName: Record<string, any> = {
          lat: params.geoName?.lat || undefined,
          lng: params.geoName?.lng || undefined,
        }
        await etm.update(Address, addressId, {
          ...params,
          geoName,
        })
      } catch (error) {
        return error.message
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
    return async (member: Member, addressId: string) => {
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
    return async (addressId: string): Promise<string> => {
      try {
        await etm.update(Address, addressId, { isMain: true })
      } catch (error) {
        return error.message
      }

      return ''
    }
  }

  async UpdateNotMainAddressesByMemberIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateNotMainAddressesByMemberIdType> {
    return async (memberId: string): Promise<string> => {
      try {
        await etm.update(Address, { memberId }, { isMain: false })
      } catch (error) {
        return error.message
      }

      return ''
    }
  }

  async UpdateNotPickupAddressesByMemberIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateNotPickupAddressesByMemberIdType> {
    return async (memberId: string, role: MemberRoleType): Promise<string> => {
      if (role !== 'Seller') {
        return "Forbidden can't update isPickup"
      }

      try {
        await etm.update(Address, { memberId }, { isPickup: false })
      } catch (error) {
        return error.message
      }

      return ''
    }
  }

  async UpdateNotReturnItemAddressesByMemberIdToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateNotReturnItemAddressesByMemberIdType> {
    return async (memberId: string, role: MemberRoleType): Promise<string> => {
      if (role !== 'Seller') {
        return "Forbidden can't update isReturnItem"
      }
      try {
        await etm.update(Address, { memberId }, { isReturnItem: false })
      } catch (error) {
        return error.message
      }

      return ''
    }
  }

  deleteAddressHandler(
    inquiryAddressById: Promise<InquiryAddressByIdType>,
    deleteAddressByIdToDb: Promise<DeleteAddressByIdInDbType>,
  ) {
    return async (member: Member, addressId: string) => {
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
        return error.message
      }

      return ''
    }
  }

  getAddressHandler(inquiryAddressById: Promise<InquiryAddressByIdType>) {
    return async (addressId: string) => {
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
    return async (addressId: string): Promise<[Address, string]> => {
      let address: Address
      try {
        address = await etm.findOne(Address, addressId, { withDeleted: false })
      } catch (error) {
        return [address, error.message]
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
    return async (memberId: string): Promise<[Address[], string]> => {
      let address: Address[]
      try {
        address = await etm.find(Address, {
          withDeleted: false,
          where: { memberId },
        })
      } catch (error) {
        return [address, error.message]
      }

      return [address, '']
    }
  }
}

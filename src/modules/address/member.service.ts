import { Injectable } from '@nestjs/common'
import { Address } from 'src/db/entities/Address'
import { Member } from 'src/db/entities/Member'
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
} from 'src/utils/response-code'

export type InsertAddreeToDbParams = {
  memberId: number
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address?: string
  geoName?: string
  isMain?: boolean
  isHome?: boolean
  isWork?: boolean
}

export type UpdateAddreeToDbParams = {
  memberId: number
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address?: string
  geoName?: string
  isMain?: boolean
  isHome?: boolean
  isWork?: boolean
}

export type InsertAddressToDbType = (
  params: InsertAddreeToDbParams,
) => Promise<[Address, string]>

export type UpdateNotMainAddressesByMemberIdType = (
  memberId: number,
) => Promise<string>

export type UpdateAddressByIdType = (
  addressId: number,
  params: UpdateAddreeToDbParams,
) => Promise<string>

export type DeleteAddressByIdInDbType = (addressId: number) => Promise<string>

export type UpdateIsMainAddressesByIdToDbType = (
  addressId: number,
) => Promise<string>

export type InquiryAddreeByIdType = (
  addressId: number,
) => Promise<[Address, string]>

export type InquiryAddressesByMemberIdType = (
  memberId: number,
) => Promise<[Address[], string]>

@Injectable()
export class MemberService {
  createAddressHandler(
    updateNotMainAddressByMemberId: Promise<
      UpdateNotMainAddressesByMemberIdType
    >,
    insertAddressToDb: Promise<InsertAddressToDbType>,
  ) {
    return async (member: Member, body: CreateAddressRequestDto) => {
      const { id: memberId } = member
      const { isMain } = body

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

      const params: InsertAddreeToDbParams = {
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
      params: InsertAddreeToDbParams,
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
    updateNotMainAddressByMemberId: Promise<
      UpdateNotMainAddressesByMemberIdType
    >,
    updateAddressByIdToDb: Promise<UpdateAddressByIdType>,
  ) {
    return async (
      member: Member,
      addressId: number,
      body: MemberUpdateAddressRequestDto,
    ) => {
      const { id: memberId } = member
      const { isMain } = body

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

      const params: UpdateAddreeToDbParams = {
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
      params: UpdateAddreeToDbParams,
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

  deleteAddressHandler(
    deleteAddressByIdToDb: Promise<DeleteAddressByIdInDbType>,
  ) {
    return async (addressId: number) => {
      const deleteAddressByIdToDbError = await (await deleteAddressByIdToDb)(
        addressId,
      )

      if (deleteAddressByIdToDbError != '') {
        return response(
          undefined,
          UnableDeleteAddressById,
          deleteAddressByIdToDbError,
        )
      }

      return response(undefined)
    }
  }

  async DeleteAddressByIdToDbFunc(
    etm: EntityManager,
  ): Promise<DeleteAddressByIdInDbType> {
    return async (addressId: number): Promise<string> => {
      try {
        await etm.getRepository(Address).softDelete(addressId)
      } catch (error) {
        return error
      }

      return ''
    }
  }

  getAddressHandler(inquiryAddreeById: Promise<InquiryAddreeByIdType>) {
    return async (addressId: number) => {
      const [addree, inquiryAddreeByIdError] = await (await inquiryAddreeById)(
        addressId,
      )

      console.log('inquiryAddreeByIdError', inquiryAddreeByIdError)
      if (inquiryAddreeByIdError != '') {
        return response(
          undefined,
          UnableInquiryAddressById,
          inquiryAddreeByIdError,
        )
      }

      return response(addree)
    }
  }

  async InquiryAddreeByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryAddreeByIdType> {
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

      const [addree, inquiryAddressesByMemberIdError] = await (
        await inquiryAddressesByMemberId
      )(memberId)

      if (inquiryAddressesByMemberIdError != '') {
        response(
          undefined,
          UnableInquiryAddressesByMemberId,
          inquiryAddressesByMemberIdError,
        )
      }

      return response(addree)
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

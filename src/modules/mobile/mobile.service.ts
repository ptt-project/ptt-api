import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { Mobile } from 'src/db/entities/Mobile'
import { response } from 'src/utils/response'
import {
  UnableToAddMobile,
  UnableToSetMainMobile,
  UnableToDeleteMobile,
} from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.service'
import {
  addMobileRegisterDto,
  addMobileRequestDto,
  deleteMobileRequestDto,
  setMainMobileRequestDto,
} from './dto/mobile.dto'

export type InquiryAddMobileType = (
  body: addMobileRequestDto | addMobileRegisterDto,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquirySetMainMobileType = (
  mobile: Mobile,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquiryDeleteMobileType = (
  mobile: Mobile,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquiryGetMobileType = (
  mobile: string,
  member: Member,
  manager: EntityManager,
) => Promise<[Mobile, string]>

@Injectable()
export class MobileService {
  addMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryAddMobile: Promise<InquiryAddMobileType>,
  ) {
    return async (
      member: Member,
      body: addMobileRequestDto,
      manager: EntityManager,
    ) => {
      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData, manager)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const { mobile } = body
      const addMobileErrorMessege = await (await inquiryAddMobile)(
        { mobile, isPrimary: false },
        member,
        manager,
      )

      if (addMobileErrorMessege != '') {
        return response(undefined, UnableToAddMobile, addMobileErrorMessege)
      }

      return response(undefined)
    }
  }

  setMainMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryGetMobileFromDb: Promise<InquiryGetMobileType>,
    inquirySetMainMobile: Promise<InquirySetMainMobileType>,
  ) {
    return async (
      member: Member,
      body: setMainMobileRequestDto,
      manager: EntityManager,
    ) => {
      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData, manager)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const { mobile } = body

      const [mobileRow, getMobileRowError] = await (
        await inquiryGetMobileFromDb
      )(mobile, member, manager)

      if (getMobileRowError != '') {
        return response(undefined, UnableToSetMainMobile, getMobileRowError)
      }

      const addMobileErrorMessege = await (await inquirySetMainMobile)(
        mobileRow,
        member,
        manager,
      )

      if (addMobileErrorMessege != '') {
        return response(undefined, UnableToSetMainMobile, addMobileErrorMessege)
      }

      return response(undefined)
    }
  }

  deleteMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryGetMobileFromDb: Promise<InquiryGetMobileType>,
    inquiryDeleteMobile: Promise<InquiryDeleteMobileType>,
  ) {
    return async (
      member: Member,
      body: deleteMobileRequestDto,
      manager: EntityManager,
    ) => {
      if (!member.mobile) {
        return response(
          undefined,
          UnableToDeleteMobile,
          'You have to set main mobile first',
        )
      }
      const verifyOtpData: verifyOtpRequestDto = {
        reference: member.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData, manager)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const { mobile } = body

      const [mobileRow, getMobileRowError] = await (
        await inquiryGetMobileFromDb
      )(mobile, member, manager)

      if (getMobileRowError != '') {
        return response(undefined, UnableToSetMainMobile, getMobileRowError)
      }
      const addMobileErrorMessege = await (await inquiryDeleteMobile)(
        mobileRow,
        member,
        manager,
      )

      if (addMobileErrorMessege != '') {
        return response(undefined, UnableToDeleteMobile, addMobileErrorMessege)
      }

      return response(undefined)
    }
  }

  async getMobileFormDbByMobilePhoneFunc(): Promise<InquiryGetMobileType> {
    return async (mobile: string, member: Member, manager: EntityManager) => {
      let mobileRow: Mobile
      try {
        mobileRow = await manager.findOne(Mobile, {
          where: {
            mobile,
            member,
            deletedAt: null,
          },
        })

        if (!mobileRow) {
          return [mobileRow, 'the mobile phone is not found in this user']
        }
      } catch (error) {
        return [null, error]
      }

      return [mobileRow, '']
    }
  }

  async addMobileFunc(): Promise<InquiryAddMobileType> {
    return async (
      body: addMobileRegisterDto,
      member: Member,
      manager: EntityManager,
    ) => {
      let mobile: Mobile
      try {
        mobile = await manager.findOne(Mobile, {
          where: {
            mobile: body.mobile,
            deletedAt: null,
          },
          relations: ['member'],
        })

        if (mobile) {
          if (mobile.member.id == member.id) {
            return 'Your mobile phone is duplicated'
          }
          if (mobile.isPrimary) {
            const oldMobileMember = await Member.findOne({
              where: {
                id: mobile.member.id,
              },
            })
            oldMobileMember.mobile = null
            await manager.save(oldMobileMember)
          }

          await manager.softRemove(mobile)
        }

        mobile = Mobile.create({
          mobile: body.mobile,
          member,
          isPrimary: body.isPrimary,
        })

        if (body.isPrimary) {
          member.mobile = body.mobile
          await manager.save(member)
        }

        await manager.save(mobile)
      } catch (error) {
        console.log(error)
        return error
      }

      return ''
    }
  }

  async setMainMobileFunc(): Promise<InquirySetMainMobileType> {
    return async (mobile: Mobile, member: Member, manager: EntityManager) => {
      try {
        const oldPrimary = await manager.findOne(Mobile, {
          where: {
            member,
            isPrimary: true,
            deletedAt: null,
          },
        })

        if (oldPrimary) {
          oldPrimary.isPrimary = false
          manager.save(oldPrimary)
        }

        mobile.isPrimary = true
        await manager.save(mobile)

        member.mobile = mobile.mobile
        await manager.save(member)
      } catch (error) {
        return error
      }

      return ''
    }
  }

  async deleteMobileFunc(): Promise<InquiryDeleteMobileType> {
    return async (mobile: Mobile, member: Member, manager: EntityManager) => {
      try {
        if (mobile.isPrimary) {
          member.mobile = null
          await manager.save(member)
        }
        await manager.softRemove(mobile)
      } catch (error) {
        return error
      }

      return ''
    }
  }
}

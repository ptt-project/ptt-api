import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Member } from 'src/db/entities/Member'
import { Mobile } from 'src/db/entities/Mobile'
import { response } from 'src/utils/response'
import {
  UnableToAddMobile,
  UnableToSetMainMobile,
  UnableToDeleteMobile,
  UnableToGetMobiles,
} from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.type'
import {
  addMobileRegisterDto,
  addMobileRequestDto,
  deleteMobileRequestDto,
  setMainMobileRequestDto,
} from './dto/mobile.dto'

import {
  InquiryAddMobileType,
  InquirySetMainMobileType,
  InquiryDeleteMobileType,
  InquiryGetMobileType,
  InquiryMobilesFuncType,
} from './mobile.type'

@Injectable()
export class MobileService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(MobileService.name)
  }

  GetMobilesHandler(
    inquiryMobiles: Promise<InquiryMobilesFuncType>,
  ) {
    return async (member: Member) => {
      const start = dayjs()
      const [mobiles, inqueryMobilesErrorMessege] = await (await inquiryMobiles)(
        member,
      )

      if (inqueryMobilesErrorMessege != '') {
        return response(undefined, UnableToGetMobiles, inqueryMobilesErrorMessege)
      }

      this.logger.info(`Done GetMobilesHandler ${dayjs().diff(start)} ms`)
      return response(mobiles)
    }
  }

  addMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryAddMobile: Promise<InquiryAddMobileType>,
  ) {
    return async (member: Member, body: addMobileRequestDto) => {
      const start = dayjs()
      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const { mobile } = body
      const addMobileErrorMessege = await (await inquiryAddMobile)(
        { mobile, isPrimary: false },
        member,
      )

      if (addMobileErrorMessege != '') {
        return response(undefined, UnableToAddMobile, addMobileErrorMessege)
      }

      this.logger.info(`Done AddMobileHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  setMainMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryGetMobileFromDb: Promise<InquiryGetMobileType>,
    inquirySetMainMobile: Promise<InquirySetMainMobileType>,
  ) {
    return async (member: Member, body: setMainMobileRequestDto) => {
      const start = dayjs()
      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const { mobile } = body

      const [mobileRow, getMobileRowError] = await (
        await inquiryGetMobileFromDb
      )(mobile, member)

      if (getMobileRowError != '') {
        return response(undefined, UnableToSetMainMobile, getMobileRowError)
      }

      const addMobileErrorMessege = await (await inquirySetMainMobile)(
        mobileRow,
        member,
      )

      if (addMobileErrorMessege != '') {
        return response(undefined, UnableToSetMainMobile, addMobileErrorMessege)
      }

      this.logger.info(`Done SetMainMobileHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  deleteMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryGetMobileFromDb: Promise<InquiryGetMobileType>,
    inquiryDeleteMobile: Promise<InquiryDeleteMobileType>,
  ) {
    return async (member: Member, body: deleteMobileRequestDto) => {
      const start = dayjs()
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
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const { mobile } = body

      const [mobileRow, getMobileRowError] = await (
        await inquiryGetMobileFromDb
      )(mobile, member)

      if (getMobileRowError != '') {
        return response(undefined, UnableToSetMainMobile, getMobileRowError)
      }
      const addMobileErrorMessege = await (await inquiryDeleteMobile)(
        mobileRow,
        member,
      )

      if (addMobileErrorMessege != '') {
        return response(undefined, UnableToDeleteMobile, addMobileErrorMessege)
      }

      this.logger.info(`Done DeleteMobileHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InqueryMobilesFunc(etm: EntityManager): Promise<InquiryMobilesFuncType> {
    return async (member: Member) => {
      const start = dayjs()
      let mobiles: Mobile[]
      try {
        mobiles = await etm.find(Mobile, {
          where: {
            memberId: member.id,
            deletedAt: null,
          },
          order: {
            isPrimary: "DESC",
            updatedAt: "DESC",
          }
        })
      } catch (error) {
        return [mobiles, error]
      }

      this.logger.info(`Done InqueryMobilesFunc ${dayjs().diff(start)} ms`)
      return [mobiles, '']
    }
  }

  async getMobileFormDbByMobilePhoneFunc(
    etm: EntityManager,
  ): Promise<InquiryGetMobileType> {
    return async (mobile: string, member: Member) => {
      const start = dayjs()
      let mobileRow: Mobile
      try {
        mobileRow = await etm.findOne(Mobile, {
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

      this.logger.info(
        `Done GetMobileFormDbByMobilePhoneFunc ${dayjs().diff(start)} ms`,
      )
      return [mobileRow, '']
    }
  }

  async addMobileFunc(etm: EntityManager): Promise<InquiryAddMobileType> {
    return async (body: addMobileRegisterDto, member: Member) => {
      const start = dayjs()
      let mobile: Mobile
      try {
        mobile = await etm.findOne(Mobile, {
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
            await etm.save(oldMobileMember)
          }

          await etm.softRemove(mobile)
        }

        mobile = etm.create(Mobile, {
          mobile: body.mobile,
          member,
          isPrimary: body.isPrimary,
        })

        if (body.isPrimary) {
          member.mobile = body.mobile
          await etm.save(member)
        }

        await etm.save(mobile)
      } catch (error) {
        console.log(error)
        return error
      }

      this.logger.info(`Done AddMobileFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async setMainMobileFunc(
    etm: EntityManager,
  ): Promise<InquirySetMainMobileType> {
    return async (mobile: Mobile, member: Member) => {
      const start = dayjs()
      try {
        const oldPrimary = await etm.findOne(Mobile, {
          where: {
            member,
            isPrimary: true,
            deletedAt: null,
          },
        })

        if (oldPrimary) {
          oldPrimary.isPrimary = false
          etm.save(oldPrimary)
        }

        mobile.isPrimary = true
        await etm.save(mobile)

        member.mobile = mobile.mobile
        await etm.save(member)
      } catch (error) {
        return error
      }

      this.logger.info(`Done SetMainMobileFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async deleteMobileFunc(etm: EntityManager): Promise<InquiryDeleteMobileType> {
    return async (mobile: Mobile, member: Member) => {
      const start = dayjs()
      try {
        if (mobile.isPrimary) {
          member.mobile = null
          await etm.save(member)
        }
        await etm.softRemove(mobile)
      } catch (error) {
        return error
      }

      this.logger.info(`Done DeleteMobileFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }
}

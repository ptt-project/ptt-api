import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { Mobile } from 'src/db/entities/Mobile'
import { response } from 'src/utils/response'
import { UnableToAddMobile, UnableToSetMainMobile, UnableToDeleteMobile } from 'src/utils/response-code'
import { validateBadRequest } from 'src/utils/response-error'
import { EntityManager } from 'typeorm'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.service'
import { addMobileRegisterDto, addMobileRequestDto, deleteMobileRequestDto, setMainMobileRequestDto } from './dto/mobile.dto'

export type InquiryAddMobileType = (
  body: addMobileRequestDto|addMobileRegisterDto,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquirySetMainMobileType = (
  mobile: string,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquiryDeleteMobileType = (
  mobile: string,
  member: Member,
  manager: EntityManager,
) => Promise<string>

@Injectable()
export class MobileService {
  addMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryAddMobile: Promise<InquiryAddMobileType>,
  ) {
    return async (member: Member, body: addMobileRequestDto, manager: EntityManager) => {
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
      const addMobileErrorMessege = await (
        await inquiryAddMobile
      )({ mobile, isPrimary: false }, member, manager)

      if (addMobileErrorMessege != '') {
        return validateBadRequest(UnableToAddMobile, addMobileErrorMessege)
      }

      return response(undefined)
    }
  }

  setMainMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquirySetMainMobile: Promise<InquirySetMainMobileType>,
  ) {
    return async (member: Member, body: setMainMobileRequestDto, manager: EntityManager) => {
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
      const addMobileErrorMessege = await (
        await inquirySetMainMobile
      )(mobile, member, manager)

      if (addMobileErrorMessege != '') {
        return validateBadRequest(UnableToSetMainMobile, addMobileErrorMessege)
      }

      return response(undefined)
    }
  }

  deleteMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryDeleteMobile: Promise<InquiryDeleteMobileType>,
  ) {
    return async (member: Member, body: deleteMobileRequestDto, manager: EntityManager) => {
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
      const addMobileErrorMessege = await (
        await inquiryDeleteMobile
      )(mobile, member, manager)

      if (addMobileErrorMessege != '') {
        return validateBadRequest(UnableToDeleteMobile, addMobileErrorMessege)
      }

      return response(undefined)
    }
  }

  async addMobileFunc(): Promise<InquiryAddMobileType> {
    return async (body: addMobileRegisterDto, member: Member, manager: EntityManager) => {
      let mobile: Mobile
        try {
          mobile = await Mobile.findOne({
            where: {
              mobile: body.mobile,
            },
            relations:['member']
          })

          if (mobile) {
            if (mobile.member.id == member.id) {
              return 'Your mobile phone is duplicated'
            }
            if (mobile.isPrimary){
              const oldMobileMember = await Member.findOne({
                where: {
                  id: mobile.member.id
                }
              })
              oldMobileMember.mobile = null
              await manager.save(oldMobileMember)
            }

            await manager.remove(mobile)
          }
          

          mobile = Mobile.create({
            mobile: body.mobile,
            member,
            isPrimary: body.isPrimary,
          })

          if (body.isPrimary){
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
    return async (mobile: string, member: Member, manager: EntityManager) => {
      let mobileRow: Mobile
        try {
          const oldPrimary = await Mobile.findOne({
            where: {
              member,
              isPrimary: true,
            }
          })

          if (oldPrimary) {
            oldPrimary.isPrimary = false
            manager.save(oldPrimary)
          }

          mobileRow = await Mobile.findOne({
            where: {
              mobile,
              member
            }
          })

          if (!mobileRow) {
            return 'the mobile phone is not found in this user'
          }

          mobileRow.isPrimary = true
          await manager.save(mobileRow)

          member.mobile = mobile
          await manager.save(member)


        } catch (error) {
          return error
        }

        return ''
    }
  }

  async deleteMobileFunc(): Promise<InquiryDeleteMobileType> {
    return async (mobile: string, member: Member, manager: EntityManager) => {
      let mobileRow: Mobile
        try {
          mobileRow = await Mobile.findOne({
            where: {
              mobile,
              member
            }
          })

          if (!mobileRow) {
            return 'the mobile phone is not found in this user'
          }
          if (mobileRow.isPrimary){
            member.mobile = null
            await manager.save(member)
          }
          await manager.remove(mobileRow)

        } catch (error) {
          return error
        }

        return ''
    }
  }


}

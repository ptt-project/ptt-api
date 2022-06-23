import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { OtpService } from '../otp/otp.service'
import { Member } from '../../db/entities/Member'
import { hashPassword } from 'src/utils/helpers'


@Injectable()
export class AuthService {
  constructor(private readonly otpService: OtpService) {}

  async helloWorld() {
    return response(undefined);
  }

  async requestOtp(body) {
    return await this.otpService.requestOtp(body);
  }

  verifyOtp() {
    return async (body) => {
      return await this.otpService.verifyOtp(body);
    }
  }

  validate(validateMember) {
    return async (body) => {
      const [_, validateError] = await validateMember(body);
      if (validateError === 'email') {
        return response(undefined, '400', 'Email is already used');
      }
      if (validateError === 'username') {
        return response(undefined, '400', 'Username is already used');
      }
      if (validateError) {
        return response(undefined, '400', 'validations failed');
      }

      return response(undefined, '200', 'Member data is available');
    }
  }

  register(verifyOtp, validateMember, createMember) {
    return async (body) => {
      const isValidOtp = await verifyOtp(body);
      if (!isValidOtp) {
        return response(undefined, '400', 'Otp is invalid');
      }

      const [_, validateError] = await validateMember(body);
      if (validateError === 'email') {
        return response(undefined, '400', 'Email is already used');
      }
      if (validateError === 'username') {
        return response(undefined, '400', 'Username is already used');
      }
      if (validateError) {
        return response(undefined, '400', validateError);
      }

      const [member, createMemberError] = await createMember(body);
      if (createMemberError) {
        return response(undefined, '400', 'Failed to create member');
      }

      return response(undefined, "200", "Create member success");
    }
  }

  validateMember() {
    return async ({email, username}) => {
      // validate member
      try {
        const member = await Member.findOne({
          where: [{
            email
          }, {
            username
          }]
        })
        console.log('member', member)
        if (!member) {
          return [true, null];
        }
        if (member.username === username) {
          return [false, 'username'];
        }
        if (member.email === email) {
          return [false, 'email'];
        }
      } catch (error) {
        console.log(error)
        return [false, error];
      }

      return [true, null];
    }
  }

  createMember() {
    return async ({
      username,
      firstname,
      lastname,
      password,
      mobile,
      pdpaStatus,
      birthday,
      spCode,
      gender,
      email,
    }) => {
      try {
        const member = new Member();
        member.username = username;
        member.firstname = firstname;
        member.lastname = lastname;
        member.password = await hashPassword(password);
        member.mobile = mobile;
        member.pdpaStatus = pdpaStatus === '1';
        member.birthday = birthday;
        member.spCode = spCode;
        member.gender = gender;
        member.email = email;

        await member.save();
      } catch (error) {
        console.log(error)
        return [false, error];
      }

      return [true, null];
    }
  }
}

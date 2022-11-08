import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'
import dayjs from 'dayjs'

@ValidatorConstraint({ name: 'validateDayjs', async: false })
export class ValidateDayjs implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return dayjs(text).isValid() // for async validations you must return a Promise<boolean> here
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    console.log('args', args)
    return `${args.property} Invalid Date`
  }
}

import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import { isUndefined, omitBy } from 'lodash'
import chalk from 'chalk'
import { InternalSeverError, InvalidJSONString } from './utils/response-code'

@Catch()
export class GlobalExeptionFilter implements ExceptionFilter {
  private logger = new Logger()
  log = (...args) => this.logger.log(chalk.red(...args))

  catch(exception: QueryFailedError) {
    let response = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: InternalSeverError,
      error: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
    }

    if (exception instanceof HttpException) {
      const res: any = exception.getResponse()
      response = {
        ...response,
        ...omitBy(res, isUndefined),
      }
      if (res.statusCode === 401 && !res.errorCode) {
        response.errorCode = InvalidJSONString
        response.error = HttpStatus[401]
      }
    }

    this.log(exception.stack)
  }
}

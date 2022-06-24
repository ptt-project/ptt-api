import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  ArgumentsHost,
} from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import { isUndefined, omitBy } from 'lodash'
import chalk from 'chalk'
import { InternalSeverError } from './utils/response-code'

@Catch()
export class GlobalExeptionFilter implements ExceptionFilter {
  private logger = new Logger()
  log = (...args) => this.logger.log(chalk.red(...args))

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    let response = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: InternalSeverError,
      message: 'InternalSeverError',
    }

    if (exception instanceof HttpException) {
      const res: any = exception.getResponse()
      response = {
        ...response,
        ...omitBy(res, isUndefined),
      }
    }

    host
      .switchToHttp()
      .getResponse()
      .status(response.statusCode)
      .json({ ...response, statusCode: undefined })
  }
}

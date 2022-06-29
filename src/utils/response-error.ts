import { HttpException, HttpStatus } from '@nestjs/common'
import { ValidationError } from 'class-validator'

type Meta = { param?: { [k: string]: any } }

export const httpError = (
  statusCode: HttpStatus,
  code?: number,
  message?: string,
  meta?: Meta,
  messages?: ValidationError[],
) => {
  let messagesTemp = undefined
  let params = undefined

  if (messages) {
    messagesTemp = messages[0].constraints
  }

  params = {
    statusCode,
    code,
    message: message || messagesTemp,
    meta,
  }

  throw new HttpException({ ...params }, statusCode)
}

export const notFound = (errorCode?: number, message?: string, meta?: Meta) => {
  httpError(HttpStatus.NOT_FOUND, errorCode, message, meta)
}

export const validateError = (
  errorCode?: number,
  message?: string,
  meta?: Meta,
) => {
  httpError(HttpStatus.UNPROCESSABLE_ENTITY, errorCode, message, meta)
}

export const validateForbidden = (
  errorCode?: number,
  message?: string,
  meta?: Meta,
) => {
  httpError(HttpStatus.FORBIDDEN, errorCode, message, meta)
}

export const validateUnauthorize = (
  errorCode?: number,
  message?: string,
  meta?: Meta,
) => {
  httpError(HttpStatus.UNAUTHORIZED, errorCode, message, meta)
}

export const validateBadRequest = (
  errorCode?: number,
  message?: string,
  meta?: Meta,
) => {
  httpError(HttpStatus.BAD_REQUEST, errorCode, message, meta)
}

export const internalSeverError = (
  errorCode?: number,
  message?: string,
  meta?: Meta,
) => {
  httpError(HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message, meta)
}

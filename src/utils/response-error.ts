import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

type Meta = { param?: { [k: string]: any } };

export const httpError = (
  statusCode: HttpStatus,
  errorCode?: number,
  meta?: Meta,
  messages?: ValidationError[],
) => {
  // console.log({ statusCode, errorCode })
  let message = undefined;
  let params = undefined;

  if (messages) {
    message = messages[0].constraints;
  }
  if (process.env.NODE_ENV === 'dev') {
    params = {
      statusCode,
      errorCode,
      message,
      error: HttpStatus[statusCode],
      meta,
    };
  } else {
    params = {
      statusCode,
      errorCode,
      error: HttpStatus[statusCode],
      meta,
    };
  }

  throw new HttpException({ ...params }, statusCode);
};

export const notFound = (
  errorCode?: number,
  meta?: Meta,
  messages?: ValidationError[],
) => {
  httpError(HttpStatus.NOT_FOUND, errorCode, meta, messages);
};

export const validateError = (
  errorCode?: number,
  meta?: Meta,
  messages?: ValidationError[],
) => {
  httpError(HttpStatus.UNPROCESSABLE_ENTITY, errorCode, meta, messages);
};

export const validateForbidden = (
  errorCode?: number,
  meta?: Meta,
  messages?: ValidationError[],
) => {
  httpError(HttpStatus.FORBIDDEN, errorCode, meta, messages);
};

export const validateUnauthorize = (
  errorCode?: number,
  meta?: Meta,
  messages?: ValidationError[],
) => {
  httpError(HttpStatus.UNAUTHORIZED, errorCode, meta, messages);
};

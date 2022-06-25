import {
  applyDecorators,
  createParamDecorator,
  UseGuards,
  ExecutionContext,
} from '@nestjs/common'

import { JwtAuthGuard } from './jwt-auth.guard'

export const Auth = () => {
  return applyDecorators(UseGuards(JwtAuthGuard))
}

export const ReqUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.member
})

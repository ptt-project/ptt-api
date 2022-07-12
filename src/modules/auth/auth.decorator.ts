import {
  applyDecorators,
  createParamDecorator,
  UseGuards,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common'

import { JwtAuthGuard } from './jwt-auth.guard'
import { RoleGuard } from './role.guard'
export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

export const Auth = (...roles: string[]) => {
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RoleGuard))
}

export const Seller = () => {
  return Auth('Seller')
}

export const ReqUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

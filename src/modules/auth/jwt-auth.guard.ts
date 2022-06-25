import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { validateUnauthorize } from 'src/utils/response-error'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    const response = context.switchToHttp().getResponse()
    response.cookies['TEST_TOKEN'] = 'SET TOKEN SUCCESS'
    return super.handleRequest(err, user, info, context, status)
  }
}

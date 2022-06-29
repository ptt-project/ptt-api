import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { validateUnauthorize } from 'src/utils/response-error'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class VersionMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    next();
  }
}

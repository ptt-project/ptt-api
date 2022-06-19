import { NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
export declare class VersionMiddleware implements NestMiddleware {
    use(request: Request, response: Response, next: NextFunction): void;
}

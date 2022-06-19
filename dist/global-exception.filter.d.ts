import { ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
export declare class GlobalExeptionFilter implements ExceptionFilter {
    private logger;
    log: (...args: any[]) => void;
    catch(exception: QueryFailedError): void;
}

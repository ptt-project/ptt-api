import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
declare type Meta = {
    param?: {
        [k: string]: any;
    };
};
export declare const httpError: (statusCode: HttpStatus, errorCode?: number, meta?: Meta, messages?: ValidationError[]) => never;
export declare const notFound: (errorCode?: number, meta?: Meta, messages?: ValidationError[]) => void;
export declare const validateError: (errorCode?: number, meta?: Meta, messages?: ValidationError[]) => void;
export declare const validateForbidden: (errorCode?: number, meta?: Meta, messages?: ValidationError[]) => void;
export declare const validateUnauthorize: (errorCode?: number, meta?: Meta, messages?: ValidationError[]) => void;
export {};

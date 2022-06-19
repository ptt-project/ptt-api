"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUnauthorize = exports.validateForbidden = exports.validateError = exports.notFound = exports.httpError = void 0;
const common_1 = require("@nestjs/common");
const httpError = (statusCode, errorCode, meta, messages) => {
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
            error: common_1.HttpStatus[statusCode],
            meta,
        };
    }
    else {
        params = {
            statusCode,
            errorCode,
            error: common_1.HttpStatus[statusCode],
            meta,
        };
    }
    throw new common_1.HttpException(Object.assign({}, params), statusCode);
};
exports.httpError = httpError;
const notFound = (errorCode, meta, messages) => {
    (0, exports.httpError)(common_1.HttpStatus.NOT_FOUND, errorCode, meta, messages);
};
exports.notFound = notFound;
const validateError = (errorCode, meta, messages) => {
    (0, exports.httpError)(common_1.HttpStatus.UNPROCESSABLE_ENTITY, errorCode, meta, messages);
};
exports.validateError = validateError;
const validateForbidden = (errorCode, meta, messages) => {
    (0, exports.httpError)(common_1.HttpStatus.FORBIDDEN, errorCode, meta, messages);
};
exports.validateForbidden = validateForbidden;
const validateUnauthorize = (errorCode, meta, messages) => {
    (0, exports.httpError)(common_1.HttpStatus.UNAUTHORIZED, errorCode, meta, messages);
};
exports.validateUnauthorize = validateUnauthorize;
//# sourceMappingURL=response-error.js.map
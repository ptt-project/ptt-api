"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = void 0;
const response = (data, code = '0', message = 'success') => {
    return {
        code,
        message,
        data,
    };
};
exports.response = response;
//# sourceMappingURL=response.js.map
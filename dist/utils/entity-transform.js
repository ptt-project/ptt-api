"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformerDayjsToDate = exports.transformerDecimalToNumber = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
exports.transformerDecimalToNumber = {
    to: (value) => value,
    from: (value) => Number(value),
};
exports.transformerDayjsToDate = {
    to: (value) => {
        if (dayjs_1.default.isDayjs(value)) {
            return value.toDate();
        }
        else {
            return value;
        }
    },
    from: (value) => {
        return value;
    },
};
//# sourceMappingURL=entity-transform.js.map
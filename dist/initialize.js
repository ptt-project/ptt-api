"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const numeral_1 = __importDefault(require("numeral"));
const dayjs_1 = __importDefault(require("dayjs"));
Date.prototype.toDayjs = function (format) {
    return (0, dayjs_1.default)(this, format);
};
Number.prototype.toDayjs = function (format) {
    return (0, dayjs_1.default)(this, format);
};
Number.prototype.format = function (format) {
    return (0, numeral_1.default)(this).format(format);
};
String.prototype.toDayjs = function (format) {
    return (0, dayjs_1.default)(this, format);
};
String.prototype.toNumber = function () {
    return (0, numeral_1.default)(this).value();
};
//# sourceMappingURL=initialize.js.map
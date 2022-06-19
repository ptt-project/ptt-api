"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExeptionFilter = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const chalk_1 = __importDefault(require("chalk"));
const response_code_1 = require("./utils/response-code");
let GlobalExeptionFilter = class GlobalExeptionFilter {
    constructor() {
        this.logger = new common_1.Logger();
        this.log = (...args) => this.logger.log(chalk_1.default.red(...args));
    }
    catch(exception) {
        let response = {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            errorCode: response_code_1.InternalSeverError,
            error: common_1.HttpStatus[common_1.HttpStatus.INTERNAL_SERVER_ERROR],
        };
        if (exception instanceof common_1.HttpException) {
            const res = exception.getResponse();
            response = Object.assign(Object.assign({}, response), (0, lodash_1.omitBy)(res, lodash_1.isUndefined));
            if (res.statusCode === 401 && !res.errorCode) {
                response.errorCode = response_code_1.InvalidJSONString;
                response.error = common_1.HttpStatus[401];
            }
        }
        this.log(exception.stack);
    }
};
GlobalExeptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExeptionFilter);
exports.GlobalExeptionFilter = GlobalExeptionFilter;
//# sourceMappingURL=global-exception.filter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const express_1 = require("express");
const global_exception_filter_1 = require("./global-exception.filter");
const response_error_1 = require("./utils/response-error");
const response_code_1 = require("./utils/response-code");
const loggerProduction = ['warn'];
const logger = process.env.LOG_LEVEL === 'debug'
    ? {}
    : process.env.LOG_LEVEL === 'production'
        ? { logger: loggerProduction }
        : {};
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, logger);
    app.enableCors({
        origin: '*',
        methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
        exposedHeaders: ['Content-Disposition'],
        credentials: true,
    });
    app.setGlobalPrefix('/api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (validationErrors = []) => {
            (0, response_error_1.httpError)(common_1.HttpStatus.BAD_REQUEST, response_code_1.InternalSeverError, undefined, validationErrors);
        },
    }));
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExeptionFilter());
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ limit: '50mb', extended: true }));
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map
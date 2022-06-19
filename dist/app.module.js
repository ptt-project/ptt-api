"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const nestjs_pino_1 = require("nestjs-pino");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const version_middleware_1 = require("./utils/middlewares/version.middleware");
require("./initialize");
const auth_modules_1 = require("./modules/auth/auth.modules");
let AppModule = class AppModule {
    configure(condumer) {
        condumer.apply(version_middleware_1.VersionMiddleware).forRoutes('/');
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                name: 'default',
                type: 'postgres',
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                synchronize: false,
                entities: ['dist/db/entities/**/*{.js,.ts}'],
                migrations: ['dist/db/migrations/**/*{.js,.ts}'],
                subscribers: ['dist/db/subscriber/**/*{.js,.ts}'],
                autoLoadEntities: true,
                logging: ['error', 'info', 'log', 'warn'],
            }),
            schedule_1.ScheduleModule.forRoot(),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    level: process.env.LOG_LEVEL === 'debug'
                        ? 'debug'
                        : process.env.LOG_LEVEL === 'production'
                            ? 'info'
                            : 'debug',
                    redact: {
                        paths: ['req.body.password'],
                        censor: '********',
                    },
                    serializers: {
                        req(req) {
                            req.body = req.raw.body;
                            return req;
                        },
                    },
                },
                exclude: [
                    { method: common_1.RequestMethod.GET, path: '/api/v1/health' },
                ],
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
            }),
            auth_modules_1.AuthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map
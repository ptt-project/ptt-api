import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import './initialize';
export declare class AppModule implements NestModule {
    configure(condumer: MiddlewareConsumer): void;
}

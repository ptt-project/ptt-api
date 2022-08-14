import { NestFactory, Reflector } from '@nestjs/core'
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  LogLevel,
  HttpStatus,
} from '@nestjs/common'
import { AppModule } from './app.module'
import { urlencoded, json } from 'express'
import { GlobalExeptionFilter } from './global-exception.filter'
import { httpError } from './utils/response-error'
import { ValidationError } from 'class-validator'
import { InvalidJSONString } from './utils/response-code'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { Logger } from 'nestjs-pino'

const loggerDebug: LogLevel[] = ['debug', 'warn', 'error', 'log']
const loggerProduction: LogLevel[] = ['warn', 'error', 'log']
const logger =
  process.env.LOG_LEVEL === 'debug'
    ? { logger: loggerDebug }
    : process.env.LOG_LEVEL === 'production'
    ? { logger: loggerProduction }
    : {}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    logger,
  )

  app.useLogger(app.get(Logger))
  app.enableCors({
    origin: ['http://localhost:3000', 'http://happyshoppingexpress.com:3000'],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
  })
  app.setGlobalPrefix('/api')
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        console.log('exceptionFactory for this.')
        httpError(
          HttpStatus.BAD_REQUEST,
          InvalidJSONString,
          undefined,
          undefined,
          validationErrors,
        )
      },
    }),
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.useGlobalFilters(new GlobalExeptionFilter())
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ limit: '50mb', extended: true }))
  app.use(cookieParser())

  await app.listen(3000)
}
bootstrap()

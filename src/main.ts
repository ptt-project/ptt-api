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

const loggerProduction: LogLevel[] = ['warn']
const logger =
  process.env.LOG_LEVEL === 'debug'
    ? {}
    : process.env.LOG_LEVEL === 'production'
    ? { logger: loggerProduction }
    : {}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    logger,
  )

  app.enableCors({
    origin: '*',
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
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

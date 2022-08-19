import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import Sharp from 'sharp'
import { response } from 'src/utils/response'
import { UnableResizeImage } from 'src/utils/response-code'
import { ImageSize, ResizeImageHandlerType } from './image.type'

const imageSizes: Record<string, ImageSize> = {
  large: { width: 1920, height: 800 },
  medium: { width: 800, height: 800 },
  small: { width: 400, height: 400 },
  thumbnail: { width: 200, height: 200 },
}

@Injectable()
export class ImageService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ImageService.name)
  }

  UplaodImageHandler(resizeImage: Promise<ResizeImageHandlerType>) {
    return async (imageOriginal: Express.Multer.File) => {
      const imageBuffers = await Object.entries(imageSizes).map(
        async ([, value]) => {
          const [newImag, errorResizeImage] = await (await resizeImage)(
            imageOriginal,
            value,
          )
          if (errorResizeImage != '') {
            return response(undefined, UnableResizeImage, errorResizeImage)
          }

          return newImag
        },
      )
      await Promise.all(imageBuffers)

      return imageBuffers[0]
    }
  }

  async ResizeImage(): Promise<ResizeImageHandlerType> {
    return async (
      imageOriginal: Express.Multer.File,
      size: ImageSize,
    ): Promise<[Buffer, string]> => {
      let newImage: Buffer
      console.log('size =>', size)
      try {
        newImage = await Sharp(imageOriginal.buffer)
          .resize(size.width, size.height)
          .toBuffer()
      } catch (error) {
        console.log('error =>', error)
        return [newImage, error]
      }

      return [newImage, '']
    }
  }
}

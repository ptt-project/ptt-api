import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import Sharp from 'sharp'
import dayjs from 'dayjs'

import { response } from 'src/utils/response'
import { UnableResizeImage } from 'src/utils/response-code'
import { ImageSize, ResizeImageHandlerType, SizeType } from './image.type'
import { InjectWebDAV, WebDAV } from 'nestjs-webdav'
import { genUuid } from 'src/utils/helpers'
import { EntityManager } from 'typeorm'
import { Image } from 'src/db/entities/Image'

const imageSizes: Record<string, ImageSize> = {
  large: { width: 1920, height: 800 },
  medium: { width: 800, height: 800 },
  small: { width: 400, height: 400 },
  thumbnail: { width: 200, height: 200 },
}

@Injectable()
export class ImageService {
  constructor(
    private readonly logger: PinoLogger,
    @InjectWebDAV('nextCloud') private readonly nextCloud: WebDAV,
  ) {
    this.logger.setContext(ImageService.name)
  }

  UplaodImageHandler(resizeImage: Promise<ResizeImageHandlerType>) {
    return async (imageOriginal: Express.Multer.File, etm: EntityManager) => {
      const id = genUuid()
      const nameDir = '/Photos/' + id
      await this.nextCloud.createDirectory(nameDir)

      Object.entries(imageSizes).map(async ([key, value]) => {
        const [newImag, errorResizeImage] = await (await resizeImage)(
          imageOriginal,
          value,
        )
        if (errorResizeImage != '') {
          return response(undefined, UnableResizeImage, errorResizeImage)
        }

        await this.nextCloud.putFileContents(
          nameDir + `/${id}` + `_${key}.jpg`,
          newImag,
        )
        return newImag
      })

      this.nextCloud.putFileContents(
        nameDir + `/${id}_original.jpg`,
        imageOriginal.buffer,
      )

      const image = etm.create(Image, { id })
      etm.save(image)
      return response({ id })
    }
  }

  async ResizeImage(): Promise<ResizeImageHandlerType> {
    return async (
      imageOriginal: Express.Multer.File,
      size: ImageSize,
    ): Promise<[Buffer, string]> => {
      const start = dayjs()
      let newImage: Buffer

      try {
        newImage = await Sharp(imageOriginal.buffer)
          .resize(size.width, size.height)
          .toBuffer()
      } catch (error) {
        return [newImage, error]
      }

      this.logger.info(`Done ResizeImage ${dayjs().diff(start)} ms`)
      return [newImage, '']
    }
  }

  GetImageHandler() {
    return async (id: string, size: SizeType) => {
      const path = `/Photos/${id}/${id}_${size}.jpg`
      return await this.nextCloud.getFileContents(path)
    }
  }
}

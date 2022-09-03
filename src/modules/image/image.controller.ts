import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { Transaction, TransactionManager, EntityManager } from 'typeorm'
import { ImageService } from './image.service'
import { SizeType } from './image.type'

@Controller('v1/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @Transaction()
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.imageService.UplaodImageHandler(
      this.imageService.ResizeImage(),
    )(file, etm)
  }

  @Get(':id/:size')
  async getImage(
    @Param('id') id: string,
    @Param('size') size: SizeType,
    @Res() res: Response,
  ) {
    const image = await this.imageService.GetImageHandler()(id, size)
    res.send(image)
  }
}

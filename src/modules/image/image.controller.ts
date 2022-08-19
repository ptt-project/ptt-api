import {
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { ImageService } from './image.service'

@Controller('v1/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  //   @Post('resize')
  //   @UseInterceptors(FileInterceptor('file'))
  //   async ResizeImage(
  //     @UploadedFile() file: Express.Multer.File,
  //     @Res() res: Response,
  //   ) {
  //     const image = await (await this.imageService.ResizeImageHandler())(file, {
  //       width: 500,
  //       height: 500,
  //     })

  //     res.send(image)
  //   }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const image = await (
      await this.imageService.UplaodImageHandler(
        this.imageService.ResizeImage(),
      )
    )(file)

    res.send(image)
  }
}

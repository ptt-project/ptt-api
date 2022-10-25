import { Module } from '@nestjs/common'
import { WebDAVModule } from 'nestjs-webdav'
import { ImageController } from './image.controller'
import { ImageService } from './service/image.service'

@Module({
  imports: [
    WebDAVModule.forRoot(
      {
        config: {
          endpoint: process.env.UPLOAD_IMAGE_HOST,
          username: process.env.UPLOAD_IMAGE_USERNAME,
          password: process.env.UPLOAD_IMAGE_PASSWORD,
        },
      },
      'nextCloud',
    ),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}

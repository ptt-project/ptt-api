import { Module } from '@nestjs/common'
import { WebDAVModule } from 'nestjs-webdav'
import { ImageController } from './image.controller'
import { ImageService } from './image.service'

@Module({
  imports: [
    WebDAVModule.forRoot(
      {
        config: {
          endpoint:
            'http://img.happyshoppingexpress.com/remote.php/dav/files/admin/',
          username: 'admin',
          password: 'LgVZ2738H',
        },
      },
      'nextCloud',
    ),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}

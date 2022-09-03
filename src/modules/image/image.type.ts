export type ImageSize = {
  width: number
  height: number
}

export type SizeType = 'large' | 'medium' | 'small' | 'thumbnail' | 'original'

export type ResizeImageHandlerType = (
  imageOriginal: Express.Multer.File,
  size: ImageSize,
) => Promise<[Buffer, string]>

export type ImageSize = {
  width: number
  height: number
}

export type ResizeImageHandlerType = (
  imageOriginal: Express.Multer.File,
  size: ImageSize,
) => Promise<[Buffer, string]>

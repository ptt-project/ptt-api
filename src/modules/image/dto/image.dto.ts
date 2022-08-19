import { IsNotEmpty, IsString } from 'class-validator'

export class ResizeImageRequestDto {
  @IsString()
  @IsNotEmpty()
  image: string
}

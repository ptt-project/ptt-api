import { IsNotEmpty, IsString } from 'class-validator'

export class ChagnePasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @IsString()
  @IsNotEmpty()
  newPassword: string
}

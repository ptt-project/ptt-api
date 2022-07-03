import { IsNotEmpty, IsString } from 'class-validator'

export class EditEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  newEmail: string

  @IsString()
  @IsNotEmpty()
  password: string
}

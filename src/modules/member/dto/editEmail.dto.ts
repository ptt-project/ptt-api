import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class EditEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  newEmail: string

  @IsString()
  @IsNotEmpty()
  password: string
}

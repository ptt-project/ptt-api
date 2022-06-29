import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ChagnePasswordRequestDto {
  @IsNumber()
  @IsNotEmpty()
  memberId: number

  @IsString()
  @IsNotEmpty()
  newPassword: string
}

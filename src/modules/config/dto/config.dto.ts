import { IsIn, IsOptional, IsString } from "class-validator";
import { LanguageOptionType } from "../config.type";

export class getConfigOptionRequestDTO {
    @IsString()
    @IsOptional()
    @IsIn(['TH', 'EN'])
    lang: LanguageOptionType
  }
import {
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsHexColor()
  colorHex: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string;
}

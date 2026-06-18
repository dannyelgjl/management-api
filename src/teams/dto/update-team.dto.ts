import {
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsHexColor()
  colorHex?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string;
}

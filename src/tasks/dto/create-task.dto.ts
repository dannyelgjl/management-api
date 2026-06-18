import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { TaskStatus } from '../task-status.enum';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(140)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsISO8601({ strict: true })
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  teamIds?: string[];
}

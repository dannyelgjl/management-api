import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Criar API REST documentada',
    minLength: 3,
    maxLength: 140,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(140)
  title?: string;

  @ApiPropertyOptional({
    example: 'Implementar contrato REST com Swagger.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    example: '2026-07-01T12:00:00.000Z',
    description: 'ISO 8601 due date.',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  dueDate?: string;

  @ApiPropertyOptional({
    example: ['7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1'],
    description: 'When sent, replaces all previous team links.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  teamIds?: string[];
}

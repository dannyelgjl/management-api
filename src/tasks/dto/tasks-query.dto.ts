import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, Matches } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TaskStatus } from '../task-status.enum';

export class TasksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: '7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1',
    description: 'Filters tasks linked to this team.',
  })
  @IsOptional()
  @IsUUID('4')
  teamId?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDING })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    example: 'createdAt:desc',
    description:
      'Format: field:direction. Fields: createdAt, updatedAt, dueDate, title, status.',
  })
  @IsOptional()
  @Matches(/^(createdAt|updatedAt|dueDate|title|status):(asc|desc)$/)
  sort = 'createdAt:desc';
}

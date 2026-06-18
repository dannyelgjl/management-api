import { IsEnum, IsOptional, IsUUID, Matches } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TaskStatus } from '../task-status.enum';

export class TasksQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  teamId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Matches(/^(createdAt|updatedAt|dueDate|title|status):(asc|desc)$/)
  sort = 'createdAt:desc';
}

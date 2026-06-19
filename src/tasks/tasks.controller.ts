import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateTaskDto } from './dto/create-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'List tasks with filters, sorting and pagination metadata',
  })
  @ApiOkResponse({ description: 'Tasks wrapped in { data, meta }.' })
  findAll(@Query() query: TasksQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Task wrapped in { data }.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiCreatedResponse({ description: 'Created task wrapped in { data }.' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task and optionally replace team links' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Updated task wrapped in { data }.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Quickly update a task status' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Updated task wrapped in { data }.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Deleted task wrapped in { data }.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tasksService.remove(id);
  }
}

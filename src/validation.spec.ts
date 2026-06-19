import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { PaginationQueryDto } from './common/dto/pagination-query.dto';
import { CreateTaskDto } from './tasks/dto/create-task.dto';
import { TasksQueryDto } from './tasks/dto/tasks-query.dto';
import { UpdateTaskStatusDto } from './tasks/dto/update-task-status.dto';
import { UpdateTaskDto } from './tasks/dto/update-task.dto';
import { TaskStatus } from './tasks/task-status.enum';
import { CreateTeamDto } from './teams/dto/create-team.dto';
import { UpdateTeamDto } from './teams/dto/update-team.dto';

async function errorProperties(dto: object) {
  const errors = await validate(dto, { whitelist: true });
  return errors.map((error) => error.property);
}

describe('DTO validation', () => {
  it('accepts valid team create and update payloads', async () => {
    await expect(
      errorProperties(
        plainToInstance(CreateTeamDto, {
          name: 'Engenharia',
          colorHex: '#16A34A',
          description: 'Time de engenharia.',
        }),
      ),
    ).resolves.toEqual([]);

    await expect(
      errorProperties(
        plainToInstance(UpdateTeamDto, {
          name: 'Plataforma',
          colorHex: '#0F766E',
        }),
      ),
    ).resolves.toEqual([]);
  });

  it('rejects invalid team payloads', async () => {
    await expect(
      errorProperties(
        plainToInstance(CreateTeamDto, {
          name: 'A',
          colorHex: 'green',
          description: 'x'.repeat(281),
        }),
      ),
    ).resolves.toEqual(['name', 'colorHex', 'description']);
  });

  it('accepts valid task payloads', async () => {
    await expect(
      errorProperties(
        plainToInstance(CreateTaskDto, {
          title: 'Criar API REST',
          description: 'Implementar CRUD.',
          status: TaskStatus.PENDING,
          dueDate: '2026-07-01T12:00:00.000Z',
          teamIds: ['7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1'],
        }),
      ),
    ).resolves.toEqual([]);

    await expect(
      errorProperties(
        plainToInstance(UpdateTaskDto, {
          title: 'Criar API REST documentada',
          status: TaskStatus.IN_PROGRESS,
          teamIds: [],
        }),
      ),
    ).resolves.toEqual([]);
  });

  it('rejects invalid task payloads', async () => {
    await expect(
      errorProperties(
        plainToInstance(CreateTaskDto, {
          title: 'ab',
          status: 'INVALID',
          dueDate: 'tomorrow',
          teamIds: ['not-a-uuid', 'not-a-uuid'],
        }),
      ),
    ).resolves.toEqual(['title', 'status', 'dueDate', 'teamIds']);
  });

  it('validates status-only updates', async () => {
    await expect(
      errorProperties(
        plainToInstance(UpdateTaskStatusDto, { status: TaskStatus.DONE }),
      ),
    ).resolves.toEqual([]);
    await expect(
      errorProperties(plainToInstance(UpdateTaskStatusDto, { status: 'DONE-ish' })),
    ).resolves.toEqual(['status']);
  });

  it('validates pagination query defaults and bounds', async () => {
    const valid = plainToInstance(PaginationQueryDto, {
      limit: '10',
      offset: '0',
      search: 'api',
    });

    expect(valid.limit).toBe(10);
    expect(valid.offset).toBe(0);
    await expect(errorProperties(valid)).resolves.toEqual([]);

    await expect(
      errorProperties(plainToInstance(PaginationQueryDto, { limit: 101, offset: -1 })),
    ).resolves.toEqual(['limit', 'offset']);
  });

  it('validates task query filters and sort format', async () => {
    await expect(
      errorProperties(
        plainToInstance(TasksQueryDto, {
          teamId: '7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1',
          status: TaskStatus.PENDING,
          search: 'api',
          sort: 'title:asc',
        }),
      ),
    ).resolves.toEqual([]);

    await expect(
      errorProperties(
        plainToInstance(TasksQueryDto, {
          teamId: 'not-a-uuid',
          status: 'UNKNOWN',
          sort: 'title:sideways',
        }),
      ),
    ).resolves.toEqual(['teamId', 'status', 'sort']);
  });
});

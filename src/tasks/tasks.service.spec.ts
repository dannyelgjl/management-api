import { BadRequestException } from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { TasksService } from './tasks.service';

const teamId = '7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1';
const missingTeamId = '98ec3555-9e61-42ef-a926-bad138af97c5';

describe('TasksService', () => {
  it('connects a task to existing teams on create', async () => {
    const prisma = {
      team: {
        findMany: jest.fn().mockResolvedValue([{ id: teamId }]),
      },
      task: {
        create: jest.fn().mockResolvedValue({
          id: 'd03d5d57-8f8d-453e-a039-ec6e10d55a52',
          title: 'Criar API REST',
          description: null,
          status: TaskStatus.PENDING,
          dueDate: null,
          createdAt: new Date('2026-06-18T12:00:00.000Z'),
          updatedAt: new Date('2026-06-18T12:00:00.000Z'),
          teams: [{ id: teamId, name: 'Engenharia', colorHex: '#16A34A' }],
        }),
      },
    };
    const service = new TasksService(prisma as never);
    const dto: CreateTaskDto = {
      title: 'Criar API REST',
      teamIds: [teamId],
    };

    await service.create(dto);

    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          teams: { connect: [{ id: teamId }] },
        }),
      }),
    );
  });

  it('rejects a task when any team id does not exist', async () => {
    const prisma = {
      team: {
        findMany: jest.fn().mockResolvedValue([{ id: teamId }]),
      },
    };
    const service = new TasksService(prisma as never);

    await expect(
      service.create({
        title: 'Criar API REST',
        teamIds: [teamId, missingTeamId],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

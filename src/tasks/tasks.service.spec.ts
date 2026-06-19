import { BadRequestException, NotFoundException } from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { TasksService } from './tasks.service';

const taskId = 'd03d5d57-8f8d-453e-a039-ec6e10d55a52';
const teamId = '7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1';
const secondTeamId = '33fdac9e-093e-46cb-9cf6-001c09829175';
const missingTeamId = '98ec3555-9e61-42ef-a926-bad138af97c5';
const now = new Date('2026-06-18T12:00:00.000Z');

const task = {
  id: taskId,
  title: 'Criar API REST',
  description: 'Implementar contrato de times e tarefas.',
  status: TaskStatus.PENDING,
  dueDate: null,
  createdAt: now,
  updatedAt: now,
  teams: [{ id: teamId, name: 'Engenharia', colorHex: '#16A34A' }],
};

function makePrismaMock() {
  return {
    $transaction: jest.fn(),
    team: {
      findMany: jest.fn(),
    },
    task: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

describe('TasksService', () => {
  it('lists tasks with team, status, search, sorting and pagination filters', async () => {
    const prisma = makePrismaMock();
    prisma.$transaction.mockResolvedValue([1, [task]]);
    const service = new TasksService(prisma as never);

    await expect(
      service.findAll({
        teamId,
        status: TaskStatus.PENDING,
        search: 'REST',
        limit: 5,
        offset: 0,
        sort: 'title:asc',
      }),
    ).resolves.toEqual({
      data: [task],
      meta: { total: 1, limit: 5, offset: 0, hasNext: false },
    });
    expect(prisma.task.count).toHaveBeenCalledWith({
      where: {
        teams: { some: { id: teamId } },
        status: TaskStatus.PENDING,
        OR: [
          { title: { contains: 'REST', mode: 'insensitive' } },
          { description: { contains: 'REST', mode: 'insensitive' } },
        ],
      },
    });
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { title: 'asc' },
        take: 5,
        skip: 0,
      }),
    );
  });

  it('uses defaults when listing tasks without query values', async () => {
    const prisma = makePrismaMock();
    prisma.$transaction.mockResolvedValue([0, []]);
    const service = new TasksService(prisma as never);

    await expect(service.findAll({} as never)).resolves.toEqual({
      data: [],
      meta: { total: 0, limit: 20, offset: 0, hasNext: false },
    });
    expect(prisma.task.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      }),
    );
  });

  it('returns one task by id', async () => {
    const prisma = makePrismaMock();
    prisma.task.findUnique.mockResolvedValue(task);
    const service = new TasksService(prisma as never);

    await expect(service.findOne(taskId)).resolves.toEqual(task);
    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: taskId },
      include: { teams: { orderBy: { name: 'asc' } } },
    });
  });

  it('throws when a task is not found', async () => {
    const prisma = makePrismaMock();
    prisma.task.findUnique.mockResolvedValue(null);
    const service = new TasksService(prisma as never);

    await expect(service.findOne(taskId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('connects a task to existing teams on create', async () => {
    const prisma = makePrismaMock();
    prisma.team.findMany.mockResolvedValue([{ id: teamId }]);
    prisma.task.create.mockResolvedValue(task);
    const service = new TasksService(prisma as never);
    const dto: CreateTaskDto = {
      title: 'Criar API REST',
      teamIds: [teamId],
    };

    await expect(service.create(dto)).resolves.toEqual(task);
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: TaskStatus.PENDING,
          teams: { connect: [{ id: teamId }] },
        }),
      }),
    );
  });

  it('creates a task without teams and with due date', async () => {
    const prisma = makePrismaMock();
    prisma.task.create.mockResolvedValue({
      ...task,
      dueDate: new Date('2026-07-01T12:00:00.000Z'),
      teams: [],
    });
    const service = new TasksService(prisma as never);

    await service.create({
      title: 'Criar API REST',
      status: TaskStatus.IN_PROGRESS,
      dueDate: '2026-07-01T12:00:00.000Z',
    });

    expect(prisma.team.findMany).not.toHaveBeenCalled();
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dueDate: new Date('2026-07-01T12:00:00.000Z'),
          status: TaskStatus.IN_PROGRESS,
          teams: undefined,
        }),
      }),
    );
  });

  it('rejects a task when any team id does not exist', async () => {
    const prisma = makePrismaMock();
    prisma.team.findMany.mockResolvedValue([{ id: teamId }]);
    const service = new TasksService(prisma as never);

    await expect(
      service.create({
        title: 'Criar API REST',
        teamIds: [teamId, missingTeamId],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deduplicates team ids before connecting', async () => {
    const prisma = makePrismaMock();
    prisma.team.findMany.mockResolvedValue([{ id: teamId }, { id: secondTeamId }]);
    prisma.task.create.mockResolvedValue(task);
    const service = new TasksService(prisma as never);

    await service.create({
      title: 'Criar API REST',
      teamIds: [teamId, teamId, secondTeamId],
    });

    expect(prisma.team.findMany).toHaveBeenCalledWith({
      where: { id: { in: [teamId, secondTeamId] } },
      select: { id: true },
    });
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          teams: { connect: [{ id: teamId }, { id: secondTeamId }] },
        }),
      }),
    );
  });

  it('updates scalar fields and replaces team links', async () => {
    const prisma = makePrismaMock();
    prisma.team.findMany.mockResolvedValue([{ id: teamId }]);
    prisma.task.update.mockResolvedValue({
      ...task,
      title: 'Criar API REST documentada',
      status: TaskStatus.IN_PROGRESS,
      dueDate: null,
    });
    const service = new TasksService(prisma as never);

    await service.update(taskId, {
      title: 'Criar API REST documentada',
      description: 'Nova descricao',
      status: TaskStatus.IN_PROGRESS,
      dueDate: '',
      teamIds: [teamId],
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: {
        title: 'Criar API REST documentada',
        description: 'Nova descricao',
        status: TaskStatus.IN_PROGRESS,
        dueDate: null,
        teams: { set: [{ id: teamId }] },
      },
      include: { teams: { orderBy: { name: 'asc' } } },
    });
  });

  it('updates a due date when a date string is provided', async () => {
    const prisma = makePrismaMock();
    prisma.task.update.mockResolvedValue({
      ...task,
      dueDate: new Date('2026-07-01T12:00:00.000Z'),
    });
    const service = new TasksService(prisma as never);

    await service.update(taskId, {
      dueDate: '2026-07-01T12:00:00.000Z',
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: { dueDate: new Date('2026-07-01T12:00:00.000Z') },
      include: { teams: { orderBy: { name: 'asc' } } },
    });
  });

  it('updates only provided fields', async () => {
    const prisma = makePrismaMock();
    prisma.task.update.mockResolvedValue(task);
    const service = new TasksService(prisma as never);

    await service.update(taskId, {});

    expect(prisma.team.findMany).not.toHaveBeenCalled();
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: {},
      include: { teams: { orderBy: { name: 'asc' } } },
    });
  });

  it('updates only the status through the quick action', async () => {
    const prisma = makePrismaMock();
    prisma.task.update.mockResolvedValue({ ...task, status: TaskStatus.DONE });
    const service = new TasksService(prisma as never);

    await expect(
      service.updateStatus(taskId, { status: TaskStatus.DONE }),
    ).resolves.toEqual(expect.objectContaining({ status: TaskStatus.DONE }));
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: { status: TaskStatus.DONE },
      include: { teams: { orderBy: { name: 'asc' } } },
    });
  });

  it('removes a task', async () => {
    const prisma = makePrismaMock();
    prisma.task.delete.mockResolvedValue(task);
    const service = new TasksService(prisma as never);

    await expect(service.remove(taskId)).resolves.toEqual(task);
    expect(prisma.task.delete).toHaveBeenCalledWith({
      where: { id: taskId },
      include: { teams: { orderBy: { name: 'asc' } } },
    });
  });
});

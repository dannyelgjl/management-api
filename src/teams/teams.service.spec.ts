import { NotFoundException } from '@nestjs/common';

import { TeamsService } from './teams.service';

const teamId = '7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1';
const now = new Date('2026-06-18T12:00:00.000Z');

const team = {
  id: teamId,
  name: 'Engenharia',
  colorHex: '#16A34A',
  description: 'Time de engenharia.',
  createdAt: now,
  updatedAt: now,
  _count: { tasks: 2 },
};

function makePrismaMock() {
  return {
    $transaction: jest.fn(),
    team: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

describe('TeamsService', () => {
  it('returns paginated teams with task count metadata', async () => {
    const prisma = makePrismaMock();
    prisma.$transaction.mockResolvedValue([1, [team]]);
    const service = new TeamsService(prisma as never);

    await expect(
      service.findAll({ limit: 10, offset: 0, search: 'eng' }),
    ).resolves.toEqual({
      data: [
        {
          id: team.id,
          name: team.name,
          colorHex: team.colorHex,
          description: team.description,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
          tasksCount: 2,
        },
      ],
      meta: {
        total: 1,
        limit: 10,
        offset: 0,
        hasNext: false,
      },
    });
    expect(prisma.team.count).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'eng', mode: 'insensitive' } },
          { description: { contains: 'eng', mode: 'insensitive' } },
        ],
      },
    });
    expect(prisma.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: 'asc' },
        take: 10,
        skip: 0,
      }),
    );
  });

  it('uses default pagination and no search filter when query is empty', async () => {
    const prisma = makePrismaMock();
    prisma.$transaction.mockResolvedValue([0, []]);
    const service = new TeamsService(prisma as never);

    await expect(service.findAll({} as never)).resolves.toEqual({
      data: [],
      meta: { total: 0, limit: 20, offset: 0, hasNext: false },
    });
    expect(prisma.team.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, take: 20, skip: 0 }),
    );
  });

  it('returns one team by id', async () => {
    const prisma = makePrismaMock();
    prisma.team.findUnique.mockResolvedValue(team);
    const service = new TeamsService(prisma as never);

    await expect(service.findOne(teamId)).resolves.toEqual(
      expect.objectContaining({ id: teamId, tasksCount: 2 }),
    );
    expect(prisma.team.findUnique).toHaveBeenCalledWith({
      where: { id: teamId },
      include: { _count: { select: { tasks: true } } },
    });
  });

  it('throws when a team is not found', async () => {
    const prisma = makePrismaMock();
    prisma.team.findUnique.mockResolvedValue(null);
    const service = new TeamsService(prisma as never);

    await expect(service.findOne(teamId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a team', async () => {
    const prisma = makePrismaMock();
    prisma.team.create.mockResolvedValue(team);
    const service = new TeamsService(prisma as never);
    const dto = {
      name: 'Engenharia',
      colorHex: '#16A34A',
      description: 'Time de engenharia.',
    };

    await expect(service.create(dto)).resolves.toEqual(
      expect.objectContaining({ id: teamId, tasksCount: 2 }),
    );
    expect(prisma.team.create).toHaveBeenCalledWith({
      data: dto,
      include: { _count: { select: { tasks: true } } },
    });
  });

  it('updates a team', async () => {
    const prisma = makePrismaMock();
    prisma.team.update.mockResolvedValue({ ...team, name: 'Plataforma' });
    const service = new TeamsService(prisma as never);
    const dto = { name: 'Plataforma' };

    await expect(service.update(teamId, dto)).resolves.toEqual(
      expect.objectContaining({ name: 'Plataforma', tasksCount: 2 }),
    );
    expect(prisma.team.update).toHaveBeenCalledWith({
      where: { id: teamId },
      data: dto,
      include: { _count: { select: { tasks: true } } },
    });
  });

  it('removes a team', async () => {
    const prisma = makePrismaMock();
    prisma.team.delete.mockResolvedValue(team);
    const service = new TeamsService(prisma as never);

    await expect(service.remove(teamId)).resolves.toEqual(
      expect.objectContaining({ id: teamId, tasksCount: 2 }),
    );
    expect(prisma.team.delete).toHaveBeenCalledWith({
      where: { id: teamId },
      include: { _count: { select: { tasks: true } } },
    });
  });
});

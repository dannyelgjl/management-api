import { TeamsService } from './teams.service';

const team = {
  id: '7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1',
  name: 'Engenharia',
  colorHex: '#16A34A',
  description: 'Time de engenharia.',
  createdAt: new Date('2026-06-18T12:00:00.000Z'),
  updatedAt: new Date('2026-06-18T12:00:00.000Z'),
  _count: { tasks: 2 },
};

describe('TeamsService', () => {
  it('returns paginated teams with task count metadata', async () => {
    const prisma = {
      $transaction: jest.fn().mockResolvedValue([1, [team]]),
      team: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const service = new TeamsService(prisma as never);

    await expect(service.findAll({ limit: 10, offset: 0 })).resolves.toEqual({
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
  });
});

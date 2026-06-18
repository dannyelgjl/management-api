import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';
import { TaskStatus } from '../src/tasks/task-status.enum';

describe('Management API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.task.deleteMany();
    await prisma.team.deleteMany();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.team.deleteMany();
    await app.close();
  });

  it('creates teams/tasks, filters tasks and updates task status', async () => {
    const teamResponse = await request(app.getHttpServer())
      .post('/api/teams')
      .send({
        name: 'Engenharia',
        colorHex: '#16A34A',
        description: 'Time responsavel pela implementacao.',
      })
      .expect(201);

    const team = teamResponse.body.data;
    expect(team).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Engenharia',
        colorHex: '#16A34A',
        tasksCount: 0,
      }),
    );

    const taskResponse = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Criar API REST',
        description: 'Implementar contrato de times e tarefas.',
        status: TaskStatus.PENDING,
        teamIds: [team.id],
      })
      .expect(201);

    const task = taskResponse.body.data;
    expect(task.teams).toEqual([
      expect.objectContaining({
        id: team.id,
        colorHex: '#16A34A',
      }),
    ]);

    const listResponse = await request(app.getHttpServer())
      .get(
        `/api/tasks?teamId=${team.id}&status=${TaskStatus.PENDING}&search=REST&limit=5&offset=0&sort=title:asc`,
      )
      .expect(200);

    expect(listResponse.body.meta).toEqual({
      total: 1,
      limit: 5,
      offset: 0,
      hasNext: false,
    });
    expect(listResponse.body.data[0].id).toBe(task.id);

    const statusResponse = await request(app.getHttpServer())
      .patch(`/api/tasks/${task.id}/status`)
      .send({ status: TaskStatus.DONE })
      .expect(200);

    expect(statusResponse.body.data.status).toBe(TaskStatus.DONE);
  });
});

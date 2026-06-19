import { Test } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { TeamsController } from './teams/teams.controller';
import { TeamsService } from './teams/teams.service';

describe('AppModule', () => {
  it('wires controllers and providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(AppController)).toBeInstanceOf(AppController);
    expect(moduleRef.get(TeamsController)).toBeInstanceOf(TeamsController);
    expect(moduleRef.get(TasksController)).toBeInstanceOf(TasksController);
    expect(moduleRef.get(TeamsService)).toBeInstanceOf(TeamsService);
    expect(moduleRef.get(TasksService)).toBeInstanceOf(TasksService);
    expect(moduleRef.get(PrismaService)).toEqual(
      expect.objectContaining({
        onModuleInit: expect.any(Function),
        onModuleDestroy: expect.any(Function),
      }),
    );

    await moduleRef.close();
  });
});

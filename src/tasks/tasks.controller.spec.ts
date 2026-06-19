import { TaskStatus } from './task-status.enum';
import { TasksController } from './tasks.controller';

const taskId = 'd03d5d57-8f8d-453e-a039-ec6e10d55a52';

describe('TasksController', () => {
  const tasksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new TasksController(tasksService as never);

  beforeEach(() => jest.clearAllMocks());

  it('delegates listing to the service', () => {
    const query = {
      limit: 10,
      offset: 0,
      status: TaskStatus.PENDING,
      sort: 'createdAt:desc',
    };
    controller.findAll(query);
    expect(tasksService.findAll).toHaveBeenCalledWith(query);
  });

  it('delegates lookup to the service', () => {
    controller.findOne(taskId);
    expect(tasksService.findOne).toHaveBeenCalledWith(taskId);
  });

  it('delegates creation to the service', () => {
    const dto = { title: 'Criar API REST', status: TaskStatus.PENDING };
    controller.create(dto);
    expect(tasksService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates updates to the service', () => {
    const dto = { title: 'Criar API REST documentada' };
    controller.update(taskId, dto);
    expect(tasksService.update).toHaveBeenCalledWith(taskId, dto);
  });

  it('delegates status updates to the service', () => {
    const dto = { status: TaskStatus.DONE };
    controller.updateStatus(taskId, dto);
    expect(tasksService.updateStatus).toHaveBeenCalledWith(taskId, dto);
  });

  it('delegates removal to the service', () => {
    controller.remove(taskId);
    expect(tasksService.remove).toHaveBeenCalledWith(taskId);
  });
});

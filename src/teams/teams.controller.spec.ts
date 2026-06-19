import { TeamsController } from './teams.controller';

const teamId = '7a2465c4-a3d8-4cf9-9b62-e626fc7be1f1';

describe('TeamsController', () => {
  const teamsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new TeamsController(teamsService as never);

  beforeEach(() => jest.clearAllMocks());

  it('delegates listing to the service', () => {
    const query = { limit: 10, offset: 0, search: 'eng' };
    controller.findAll(query);
    expect(teamsService.findAll).toHaveBeenCalledWith(query);
  });

  it('delegates lookup to the service', () => {
    controller.findOne(teamId);
    expect(teamsService.findOne).toHaveBeenCalledWith(teamId);
  });

  it('delegates creation to the service', () => {
    const dto = { name: 'Engenharia', colorHex: '#16A34A' };
    controller.create(dto);
    expect(teamsService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates updates to the service', () => {
    const dto = { name: 'Plataforma' };
    controller.update(teamId, dto);
    expect(teamsService.update).toHaveBeenCalledWith(teamId, dto);
  });

  it('delegates removal to the service', () => {
    controller.remove(teamId);
    expect(teamsService.remove).toHaveBeenCalledWith(teamId);
  });
});

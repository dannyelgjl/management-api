import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns service health information', () => {
    const controller = new AppController();

    expect(controller.health()).toEqual({
      status: 'ok',
      service: 'management-api',
      timestamp: expect.any(String),
    });
  });
});

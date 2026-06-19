describe('main bootstrap', () => {
  const originalPort = process.env.PORT;

  afterEach(() => {
    process.env.PORT = originalPort;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('creates, configures and listens with the configured port', async () => {
    process.env.PORT = '4321';
    const listen = jest.fn().mockResolvedValue(undefined);
    const app = { listen };
    const create = jest.fn().mockResolvedValue(app);
    const configureApp = jest.fn(() => app);

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create },
    }));
    jest.doMock('./bootstrap', () => ({ configureApp }));

    await import('./main');
    await new Promise((resolve) => setImmediate(resolve));

    expect(create).toHaveBeenCalledWith(expect.any(Function));
    expect(configureApp).toHaveBeenCalledWith(app);
    expect(listen).toHaveBeenCalledWith(4321);
  });

  it('uses port 3000 by default', async () => {
    delete process.env.PORT;
    const listen = jest.fn().mockResolvedValue(undefined);
    const app = { listen };
    const create = jest.fn().mockResolvedValue(app);
    const configureApp = jest.fn(() => app);

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create },
    }));
    jest.doMock('./bootstrap', () => ({ configureApp }));

    await import('./main');
    await new Promise((resolve) => setImmediate(resolve));

    expect(listen).toHaveBeenCalledWith(3000);
  });
});

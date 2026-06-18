const { spawnSync } = require('node:child_process');

const databaseUrl =
  process.env.TEST_DATABASE_URL ||
  'postgresql://management:management@localhost:5432/management_api_test?schema=public';

function run(command, args) {
  const result = spawnSync(command, args, {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      NODE_ENV: 'test',
    },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npx', ['prisma', 'migrate', 'deploy']);
run('npx', ['jest', '--config', './test/jest-e2e.json', '--runInBand']);

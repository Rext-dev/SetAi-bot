import { main } from '../src/index';

jest.mock('../src/services/client', () => ({
  createClient: () => ({ login: jest.fn().mockResolvedValue(undefined) })
}));

describe('main', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('lanza error si falta DISCORD_TOKEN', async () => {
    delete process.env.DISCORD_TOKEN;
    await expect(main()).rejects.toThrow('MISSING_DISCORD_TOKEN');
  });

  it('login cuando hay token', async () => {
    process.env.DISCORD_TOKEN = 'abc';
    await expect(main()).resolves.toBeDefined();
  });
});

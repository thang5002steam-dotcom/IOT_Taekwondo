type RawDatabaseMock = {
  execSync: jest.Mock<void, [string]>;
};

type DrizzleDatabaseMock = {
  transaction: jest.Mock<unknown, [(tx: unknown) => unknown]>;
};

async function loadDatabaseModule() {
  jest.resetModules();

  const rawDatabase: RawDatabaseMock = {
    execSync: jest.fn(),
  };
  const transactionScope = { transaction: true };
  const drizzleDatabase: DrizzleDatabaseMock = {
    transaction: jest.fn((callback) => callback(transactionScope)),
  };
  const openDatabaseSync = jest.fn(() => rawDatabase);
  const drizzle = jest.fn(() => drizzleDatabase);
  const migrate = jest.fn(async () => undefined);

  jest.doMock('expo-sqlite', () => ({ openDatabaseSync }));
  jest.doMock('drizzle-orm/expo-sqlite', () => ({ drizzle }));
  jest.doMock('drizzle-orm/expo-sqlite/migrator', () => ({ migrate }));
  jest.doMock('./migrations/migrations', () => ({
    __esModule: true,
    default: { journal: { entries: [] }, migrations: {} },
  }));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const databaseModule = require('@/infrastructure/database/database') as typeof import('@/infrastructure/database/database');

  return {
    databaseModule,
    drizzle,
    drizzleDatabase,
    migrate,
    openDatabaseSync,
    rawDatabase,
    transactionScope,
  };
}

describe('database', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.dontMock('expo-sqlite');
    jest.dontMock('drizzle-orm/expo-sqlite');
    jest.dontMock('drizzle-orm/expo-sqlite/migrator');
    jest.dontMock('./migrations/migrations');
  });

  it('opens the SQLite database once and exposes shared database instances', async () => {
    const {
      databaseModule,
      drizzle,
      drizzleDatabase,
      openDatabaseSync,
      rawDatabase,
    } = await loadDatabaseModule();

    expect(openDatabaseSync).toHaveBeenCalledTimes(1);
    expect(openDatabaseSync).toHaveBeenCalledWith('taekwondo.db', {
      enableChangeListener: true,
    });
    expect(drizzle).toHaveBeenCalledWith(rawDatabase, {
      schema: expect.any(Object),
    });
    expect(databaseModule.getDatabase()).toBe(drizzleDatabase);
    expect(databaseModule.getRawDatabase()).toBe(rawDatabase);
  });

  it('initializes once across concurrent callers and runs migrations', async () => {
    const { databaseModule, migrate, rawDatabase } = await loadDatabaseModule();

    await Promise.all([
      databaseModule.initializeDatabase(),
      databaseModule.initializeDatabase(),
    ]);
    await databaseModule.initializeDatabase();

    expect(rawDatabase.execSync).toHaveBeenCalledWith('PRAGMA journal_mode = WAL;');
    expect(rawDatabase.execSync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
    expect(migrate).toHaveBeenCalledTimes(1);
  });

  it('routes transactions through Drizzle and returns callback results', async () => {
    const { databaseModule, drizzleDatabase, transactionScope } =
      await loadDatabaseModule();

    const result = databaseModule.transaction((tx) => {
      expect(tx).toBe(transactionScope);
      return 'committed';
    });

    expect(result).toBe('committed');
    expect(drizzleDatabase.transaction).toHaveBeenCalledTimes(1);
  });

  it('logs and propagates transaction failures for Drizzle rollback handling', async () => {
    const { databaseModule, drizzleDatabase } = await loadDatabaseModule();
    const failure = new Error('rollback this transaction');
    drizzleDatabase.transaction.mockImplementationOnce(() => {
      throw failure;
    });

    expect(() => databaseModule.transaction(() => undefined)).toThrow(failure);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[SQLite] transaction failed',
      failure,
    );
  });
});

import type { AppMetadata } from '@/infrastructure/database/schema';

type SelectLimitChain = {
  limit: jest.Mock<Promise<AppMetadata[]>, [number]>;
};

type SelectWhereChain = {
  where: jest.Mock<SelectLimitChain, [unknown]>;
};

type SelectChain = {
  from: jest.Mock<Promise<AppMetadata[]> | SelectWhereChain, [unknown]>;
};

type InsertConflictChain = {
  onConflictDoUpdate: jest.Mock<Promise<void>, [unknown]>;
};

type InsertValuesChain = {
  values: jest.Mock<InsertConflictChain, [unknown]>;
};

type InsertChain = {
  insert: jest.Mock<InsertValuesChain, [unknown]>;
};

type DeleteChain = {
  where: jest.Mock<Promise<void>, [unknown]>;
};

function createSelectByKeyChain(rows: AppMetadata[]) {
  const limit = jest.fn<Promise<AppMetadata[]>, [number]>(
    async () => rows,
  );
  const where = jest.fn<SelectLimitChain, [unknown]>(() => ({ limit }));
  const from = jest.fn<SelectWhereChain, [unknown]>(() => ({ where }));
  return { from, limit, where };
}

function createSelectAllChain(rows: AppMetadata[]) {
  const from = jest.fn<Promise<AppMetadata[]>, [unknown]>(async () => rows);
  return { from };
}

describe('appMetadataRepository', () => {
  afterEach(() => {
    jest.dontMock('@/infrastructure/database/database');
  });

  it('reads one metadata row by key', async () => {
    jest.resetModules();
    const row: AppMetadata = {
      key: 'schema.version',
      value: '1',
      updatedAt: new Date('2026-09-04T00:00:00.000Z'),
    };
    const selectChain = createSelectByKeyChain([row]);
    const mockDb = {
      select: jest.fn<SelectChain, []>(() => selectChain),
    };
    jest.doMock('@/infrastructure/database/database', () => ({ db: mockDb }));

    const { appMetadataRepository } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./appMetadataRepository') as typeof import('./appMetadataRepository');

    await expect(appMetadataRepository.getByKey('schema.version')).resolves.toBe(row);
    expect(mockDb.select).toHaveBeenCalledTimes(1);
    expect(selectChain.where).toHaveBeenCalledTimes(1);
    expect(selectChain.limit).toHaveBeenCalledWith(1);
  });

  it('returns null when metadata key does not exist', async () => {
    jest.resetModules();
    const selectChain = createSelectByKeyChain([]);
    const mockDb = {
      select: jest.fn<SelectChain, []>(() => selectChain),
    };
    jest.doMock('@/infrastructure/database/database', () => ({ db: mockDb }));

    const { appMetadataRepository } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./appMetadataRepository') as typeof import('./appMetadataRepository');

    await expect(appMetadataRepository.getByKey('missing')).resolves.toBeNull();
  });

  it('reads all metadata rows', async () => {
    jest.resetModules();
    const rows: AppMetadata[] = [
      {
        key: 'schema.version',
        value: '1',
        updatedAt: new Date('2026-09-04T00:00:00.000Z'),
      },
    ];
    const selectChain = createSelectAllChain(rows);
    const mockDb = {
      select: jest.fn<SelectChain, []>(() => selectChain),
    };
    jest.doMock('@/infrastructure/database/database', () => ({ db: mockDb }));

    const { appMetadataRepository } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./appMetadataRepository') as typeof import('./appMetadataRepository');

    await expect(appMetadataRepository.getAll()).resolves.toBe(rows);
    expect(selectChain.from).toHaveBeenCalledTimes(1);
  });

  it('upserts metadata with Drizzle insert conflict handling', async () => {
    jest.resetModules();
    const onConflictDoUpdate = jest.fn<Promise<void>, [unknown]>(
      async () => undefined,
    );
    const values = jest.fn<InsertConflictChain, [unknown]>(() => ({
      onConflictDoUpdate,
    }));
    const mockDb: InsertChain = {
      insert: jest.fn<InsertValuesChain, [unknown]>(() => ({ values })),
    };
    jest.doMock('@/infrastructure/database/database', () => ({ db: mockDb }));

    const { appMetadataRepository } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./appMetadataRepository') as typeof import('./appMetadataRepository');
    const updatedAt = new Date('2026-09-04T00:00:00.000Z');

    await appMetadataRepository.upsert({
      key: 'schema.version',
      value: '1',
      updatedAt,
    });

    expect(values).toHaveBeenCalledWith({
      key: 'schema.version',
      value: '1',
      updatedAt,
    });
    expect(onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: { value: '1', updatedAt },
      }),
    );
  });

  it('deletes metadata by key', async () => {
    jest.resetModules();
    const deleteChain: DeleteChain = {
      where: jest.fn<Promise<void>, [unknown]>(async () => undefined),
    };
    const mockDb = {
      delete: jest.fn<DeleteChain, [unknown]>(() => deleteChain),
    };
    jest.doMock('@/infrastructure/database/database', () => ({ db: mockDb }));

    const { appMetadataRepository } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./appMetadataRepository') as typeof import('./appMetadataRepository');

    await appMetadataRepository.deleteByKey('schema.version');
    expect(mockDb.delete).toHaveBeenCalledTimes(1);
    expect(deleteChain.where).toHaveBeenCalledTimes(1);
  });
});

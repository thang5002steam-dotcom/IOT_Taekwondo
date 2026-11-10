import { eq } from 'drizzle-orm';

import { db } from '@/infrastructure/database/database';
import {
  appMetadata,
  type AppMetadata,
  type NewAppMetadata,
} from '@/infrastructure/database/schema';

type UpsertAppMetadataInput = {
  key: string;
  value: string | null;
  updatedAt?: Date;
};

export const appMetadataRepository = {
  async getByKey(key: string): Promise<AppMetadata | null> {
    const rows = await db
      .select()
      .from(appMetadata)
      .where(eq(appMetadata.key, key))
      .limit(1);

    return rows[0] ?? null;
  },

  async getAll(): Promise<AppMetadata[]> {
    return db.select().from(appMetadata);
  },

  async upsert(input: UpsertAppMetadataInput): Promise<void> {
    const row: NewAppMetadata = {
      key: input.key,
      value: input.value,
      updatedAt: input.updatedAt ?? new Date(),
    };

    await db
      .insert(appMetadata)
      .values(row)
      .onConflictDoUpdate({
        target: appMetadata.key,
        set: {
          value: row.value,
          updatedAt: row.updatedAt,
        },
      });
  },

  async deleteByKey(key: string): Promise<void> {
    await db.delete(appMetadata).where(eq(appMetadata.key, key));
  },
};

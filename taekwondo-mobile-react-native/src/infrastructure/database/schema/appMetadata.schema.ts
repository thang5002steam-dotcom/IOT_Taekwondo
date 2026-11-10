import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const appMetadata = sqliteTable('app_metadata', {
  key: text('key').primaryKey(),
  value: text('value'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export type AppMetadata = typeof appMetadata.$inferSelect;
export type NewAppMetadata = typeof appMetadata.$inferInsert;

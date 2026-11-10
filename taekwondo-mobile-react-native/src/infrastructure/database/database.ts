import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';

import migrations from './migrations/migrations';
import * as schema from './schema';

export const DATABASE_NAME = 'taekwondo.db';

const rawDatabase = SQLite.openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});

export const db = drizzle(rawDatabase, { schema });

export type AppDatabase = typeof db;
export type AppDatabaseTransaction =
  Parameters<AppDatabase['transaction']>[0] extends (tx: infer Transaction) => unknown
    ? Transaction
    : never;

let initializePromise: Promise<void> | null = null;
let initialized = false;

function logAndRethrow(operation: string, error: unknown): never {
  console.error(`[SQLite] ${operation} failed`, error);
  throw error;
}

function configureRawDatabase(): void {
  rawDatabase.execSync('PRAGMA journal_mode = WAL;');
  rawDatabase.execSync('PRAGMA foreign_keys = ON;');
}

export function getDatabase(): AppDatabase {
  return db;
}

export function getRawDatabase(): SQLite.SQLiteDatabase {
  return rawDatabase;
}

export function initializeDatabase(): Promise<void> {
  if (initialized) return Promise.resolve();
  if (initializePromise) return initializePromise;

  initializePromise = (async () => {
    try {
      configureRawDatabase();
      await migrate(db, migrations);
      initialized = true;
    } catch (error: unknown) {
      initializePromise = null;
      logAndRethrow('initialize', error);
    }
  })();

  return initializePromise;
}

export function transaction<T>(
  callback: (transactionDb: AppDatabaseTransaction) => T,
): T {
  try {
    return db.transaction(callback);
  } catch (error: unknown) {
    logAndRethrow('transaction', error);
  }
}

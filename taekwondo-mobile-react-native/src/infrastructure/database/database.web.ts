/**
 * Web adapter for the application database seam.
 *
 * The current browser features do not persist data in SQLite. Keeping this
 * adapter free of `expo-sqlite` also prevents native database code from being
 * pulled into the web bundle. Add a real web database adapter only when a
 * designated web feature owns a concrete persistence requirement.
 */
export const DATABASE_NAME = 'taekwondo.db';

function unsupportedDatabaseAccess(): never {
  throw new Error('The local SQLite database is unavailable on web.');
}

export const db = new Proxy(
  {},
  {
    get: unsupportedDatabaseAccess,
  },
);

export type AppDatabase = typeof db;
export type AppDatabaseTransaction = never;

export function getDatabase(): AppDatabase {
  return db;
}

export function getRawDatabase(): never {
  return unsupportedDatabaseAccess();
}

export function initializeDatabase(): Promise<void> {
  return Promise.resolve();
}

export function transaction<T>(
  _callback: (transactionDb: AppDatabaseTransaction) => T,
): T {
  return unsupportedDatabaseAccess();
}

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PERMISSION_VALUES } from './permissions';

/**
 * Keeps the FE permission catalog in sync with the backend enum.
 *
 * The backend repository is a sibling project that is not always available
 * (e.g. mobile-only CI), so the test skips when the file cannot be resolved.
 * Override the location with BACKEND_JAVA_REPO_DIR when needed.
 */
const PERMISSION_FILE_RELATIVE =
  'src/main/java/com/dat/ai_receptionist_web/enums/Security/PermissionDefinition.java';

const BACKEND_DIR_CANDIDATES = [
  process.env.BACKEND_JAVA_REPO_DIR,
  'D:\\ai-receptionist-web\\ai-receptionist-web-be-java',
  'D:\\TKD_Van_Quan\\ai-receptionist-web-be-java',
  join(process.cwd(), '..', 'ai-receptionist-web-be-java'),
].filter((directory): directory is string => Boolean(directory));

const BACKEND_PERMISSION_FILE =
  BACKEND_DIR_CANDIDATES.map((directory) =>
    join(directory, PERMISSION_FILE_RELATIVE),
  ).find((file) => existsSync(file)) ??
  join(BACKEND_DIR_CANDIDATES[0], PERMISSION_FILE_RELATIVE);

function extractBackendPermissionCodes(source: string): string[] {
  const codes = new Set<string>();
  for (const match of source.matchAll(/\("([A-Z][A-Z0-9_]+)"/g)) {
    codes.add(match[1]);
  }
  return [...codes].sort();
}

it('mirrors every permission code defined by the backend PermissionDefinition', () => {
  if (!existsSync(BACKEND_PERMISSION_FILE)) {
    // Backend repo not available in this environment; the mirror is still
    // reviewed manually through the sync comment in permissions.ts.
    console.warn(
      `[permissions.sync] Backend PermissionDefinition not found at ${BACKEND_PERMISSION_FILE}; skipping.`,
    );
    return;
  }

  const backendCodes = extractBackendPermissionCodes(
    readFileSync(BACKEND_PERMISSION_FILE, 'utf8'),
  );
  const frontendCodes = [...PERMISSION_VALUES].sort();

  expect(backendCodes).toEqual(frontendCodes);
});

import { keyValueStorage } from "@/infrastructure/storage/keyValueStorage";

const STORAGE_KEY = "activities.quick.v1";

type QuickActivitiesEnvelope = {
  version: 1;
  ids: string[];
};

function isQuickActivitiesEnvelope(
  value: unknown,
): value is QuickActivitiesEnvelope {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Partial<QuickActivitiesEnvelope>;
  return (
    envelope.version === 1 &&
    Array.isArray(envelope.ids) &&
    envelope.ids.every((id) => typeof id === "string")
  );
}

export const activitiesQuickStorageService = {
  async read(): Promise<string[] | null> {
    const raw = await keyValueStorage.get(STORAGE_KEY);
    if (!raw) return null;

    try {
      const envelope: unknown = JSON.parse(raw);
      return isQuickActivitiesEnvelope(envelope) ? envelope.ids : null;
    } catch {
      return null;
    }
  },

  write(ids: string[]): Promise<void> {
    const envelope: QuickActivitiesEnvelope = { version: 1, ids };
    return keyValueStorage.set(STORAGE_KEY, JSON.stringify(envelope));
  },
};

export function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

export function containsSearch(
  search: string,
  ...values: (string | null | undefined)[]
) {
  const needle = normalizeSearch(search);
  return (
    !needle ||
    values.some((value) => value?.toLocaleLowerCase("vi-VN").includes(needle))
  );
}

export function initials(value?: string | null) {
  const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
  return (
    parts.length > 1
      ? `${parts[0][0]}${parts.at(-1)?.[0]}`
      : parts[0]?.slice(0, 2) ?? "?"
  ).toLocaleUpperCase("vi-VN");
}

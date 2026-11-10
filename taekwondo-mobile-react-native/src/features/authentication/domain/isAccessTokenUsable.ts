export function isAccessTokenUsable(token: string, clockSkewSeconds = 30): boolean {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return false;

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(globalThis.atob(padded)) as { exp?: unknown };
    if (typeof payload.exp !== 'number') return false;

    return payload.exp * 1000 > Date.now() + clockSkewSeconds * 1000;
  } catch {
    return false;
  }
}

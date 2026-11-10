import type { RepEvent } from "../types/kneeCounter.types";
export class RepEventLedger {
  private readonly byId = new Map<string, RepEvent>();
  append(events: RepEvent[]) { events.forEach((event) => this.byId.set(event.id, event)); return this.all(); }
  all() { return [...this.byId.values()].sort((a, b) => a.completedAtMs - b.completedAtMs); }
  clear() { this.byId.clear(); }
}

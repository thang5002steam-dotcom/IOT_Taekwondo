import type { SparringCommand, SparringRoomEnvelope } from '../domain/sparring.types';

export type SparringRoomEvent =
  | { type: 'snapshot'; data: SparringRoomEnvelope }
  | { type: 'error'; data: { message: string } };

export interface SparringRoomClient {
  connect(options: { roomCode: string; ticket: string }): void;
  send(command: SparringCommand): void;
  subscribe(handler: (event: SparringRoomEvent) => void): () => void;
  disconnect(): void;
}

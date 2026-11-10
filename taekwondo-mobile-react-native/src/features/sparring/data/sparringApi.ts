import { javaApi } from '@/infrastructure/http/httpClient';
import type { SparringRoomEnvelope } from '../domain/sparring.types';

export type SparringSocketTicket = { roomCode: string; ticket: string; operator: boolean; expiresAtEpochMs: number };

export const sparringApi = {
  createRoom: async (): Promise<SparringRoomEnvelope> => (await javaApi.post('/sparring/rooms')).data,
  getRoom: async (roomCode: string): Promise<SparringRoomEnvelope> => (await javaApi.get(`/sparring/rooms/${roomCode}`)).data,
  createSocketTicket: async (roomCode: string): Promise<SparringSocketTicket> => (await javaApi.post(`/sparring/rooms/${roomCode}/socket-ticket`)).data,
};

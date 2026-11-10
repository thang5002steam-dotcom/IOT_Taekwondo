import { javaApi } from '@/infrastructure/http/httpClient';
import type { PracticeEnvelope, PracticeTicket } from '../domain/practice.types';

export const practiceApi = {
  create: async (maximumJudges: number, consensusJudges: number): Promise<PracticeEnvelope> =>
    (await javaApi.post('/sparring/practice-rooms', { maximumJudges, consensusJudges })).data,
  get: async (roomCode: string): Promise<PracticeEnvelope> => (await javaApi.get(`/sparring/practice-rooms/${roomCode}`)).data,
  ticket: async (roomCode: string, role: 'judge' | 'operator'): Promise<PracticeTicket> =>
    (await javaApi.post(`/sparring/practice-rooms/${roomCode}/socket-ticket`, undefined, { params: { role } })).data,
  uploadUrl: async (roomCode: string): Promise<{ uploadUrl: string; objectPath: string; maxBytes: number }> =>
    (await javaApi.post(`/sparring/practice-rooms/${roomCode}/video-upload`)).data,
  uploadComplete: async (roomCode: string, objectPath: string): Promise<PracticeEnvelope> =>
    (await javaApi.post(`/sparring/practice-rooms/${roomCode}/video-upload-complete`, { objectPath })).data,
};

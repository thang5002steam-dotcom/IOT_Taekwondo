import { env } from '@/config/env';
import type { SparringCommand } from '../domain/sparring.types';
import type { SparringRoomClient, SparringRoomEvent } from '../services/SparringRoomClient';

function socketUrl(ticket: string): string {
  const base = env.javaApiUrl.replace(/\/api\/v1\/?$/, '').replace(/^http/, 'ws');
  return `${base}/ws/sparring?ticket=${encodeURIComponent(ticket)}`;
}

export class WebSocketSparringRoomClient implements SparringRoomClient {
  private socket: WebSocket | null = null;
  private readonly handlers = new Set<(event: SparringRoomEvent) => void>();
  connect({ ticket }: { roomCode: string; ticket: string }): void {
    this.disconnect();
    this.socket = new WebSocket(socketUrl(ticket));
    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as SparringRoomEvent;
        this.handlers.forEach((handler) => handler(parsed));
      } catch { this.handlers.forEach((handler) => handler({ type: 'error', data: { message: 'Dữ liệu phòng không hợp lệ' } })); }
    };
    this.socket.onerror = () => this.handlers.forEach((handler) => handler({ type: 'error', data: { message: 'Mất kết nối phòng thi đấu' } }));
  }
  send(command: SparringCommand): void { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(command)); }
  subscribe(handler: (event: SparringRoomEvent) => void): () => void { this.handlers.add(handler); return () => this.handlers.delete(handler); }
  disconnect(): void { this.socket?.close(); this.socket = null; }
}

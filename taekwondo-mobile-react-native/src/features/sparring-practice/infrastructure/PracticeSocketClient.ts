import { env } from '@/config/env';
import type { PracticeCommand, PracticeEvent } from '../domain/practice.types';

const urlFor = (ticket: string) => `${env.javaApiUrl.replace(/\/api\/v1\/?$/, '').replace(/^http/, 'ws')}/ws/sparring-practice?ticket=${encodeURIComponent(ticket)}`;

/** Không xếp hàng phiếu điểm khi offline: phiếu cũ không được gửi sau khi room đã pause. */
export class PracticeSocketClient {
  private socket: WebSocket | null = null;
  private handlers = new Set<(event: PracticeEvent) => void>();
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  connect(ticket: string) {
    this.disconnect(); this.socket = new WebSocket(urlFor(ticket));
    this.socket.onmessage = ({ data }) => { try { this.handlers.forEach(h => h(JSON.parse(String(data)) as PracticeEvent)); } catch { this.error('Dữ liệu phòng luyện tập không hợp lệ'); } };
    this.socket.onerror = () => this.error('Mất kết nối phòng luyện tập');
    this.socket.onopen = () => { this.send({ type: 'heartbeat' }); this.heartbeat = setInterval(() => this.send({ type: 'heartbeat' }), 5_000); };
  }
  send(command: PracticeCommand) { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(command)); }
  subscribe(handler: (event: PracticeEvent) => void) { this.handlers.add(handler); return () => this.handlers.delete(handler); }
  disconnect() { if (this.heartbeat) clearInterval(this.heartbeat); this.heartbeat = null; this.socket?.close(); this.socket = null; }
  private error(message: string) { this.handlers.forEach(h => h({ type: 'error', data: { message } })); }
}

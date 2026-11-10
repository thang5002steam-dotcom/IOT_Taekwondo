import { useCallback, useEffect, useRef, useState } from 'react';
import { sparringApi } from '../data/sparringApi';
import { EMPTY_SPARRING_SNAPSHOT } from '../domain/sparringRoom';
import type { SparringCommand, SparringSnapshot } from '../domain/sparring.types';
import { WebSocketSparringRoomClient } from '../infrastructure/WebSocketSparringRoomClient';

export function useSparringRoom(roomCode: string) {
  const clientRef = useRef(new WebSocketSparringRoomClient());
  const [snapshot, setSnapshot] = useState<SparringSnapshot>(EMPTY_SPARRING_SNAPSHOT);
  const [operator, setOperator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  useEffect(() => {
    let active = true;
    const client = clientRef.current;
    const unsubscribe = client.subscribe((event) => {
      if (event.type === 'snapshot') { setSnapshot(event.data.snapshot); setConnecting(false); }
      else setError(event.data.message);
    });
    void sparringApi.createSocketTicket(roomCode).then((ticket) => {
      if (!active) return;
      setOperator(ticket.operator); client.connect({ roomCode, ticket: ticket.ticket });
    }).catch(() => { if (active) { setError('Không thể vào phòng thi đấu'); setConnecting(false); } });
    return () => { active = false; unsubscribe(); client.disconnect(); };
  }, [roomCode]);
  const send = useCallback((command: SparringCommand) => clientRef.current.send(command), []);
  return { snapshot, operator, error, connecting, send };
}

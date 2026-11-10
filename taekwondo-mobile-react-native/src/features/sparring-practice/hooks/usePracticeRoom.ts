import { useCallback, useEffect, useRef, useState } from 'react';
import { practiceApi } from '../data/practiceApi';
import { EMPTY_PRACTICE, type PracticeCommand, type PracticeSnapshot } from '../domain/practice.types';
import { PracticeSocketClient } from '../infrastructure/PracticeSocketClient';

export function usePracticeRoom(roomCode: string, role: 'judge' | 'operator' = 'judge') {
  const client = useRef(new PracticeSocketClient());
  const [snapshot, setSnapshot] = useState<PracticeSnapshot>(EMPTY_PRACTICE);
  const [operator, setOperator] = useState(false); const [error, setError] = useState<string | null>(null); const [connecting, setConnecting] = useState(true);
  useEffect(() => { let mounted = true; const socketClient = client.current; const unsubscribe = socketClient.subscribe(event => { if (event.type === 'snapshot') { setSnapshot(event.data.snapshot); setError(null); setConnecting(false); } else setError(event.data.message); });
    void practiceApi.ticket(roomCode, role).then(ticket => { if (!mounted) return; setOperator(ticket.operator); socketClient.connect(ticket.ticket); }).catch(() => { if(mounted){setError('Không thể vào phòng luyện tập');setConnecting(false);} });
    return () => { mounted=false; unsubscribe(); socketClient.disconnect(); };
  }, [role, roomCode]);
  return { snapshot, operator, error, connecting, send: useCallback((command: PracticeCommand) => client.current.send(command), []) };
}

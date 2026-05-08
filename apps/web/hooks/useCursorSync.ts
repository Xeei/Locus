import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CursorPulse } from '../types/cursor';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useCursorSync(roomId: string = 'map:main-workspace') {
  const [remoteCursors, setRemoteCursors] = useState<Record<string, CursorPulse>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io(SOCKET_SERVER_URL);

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to cursor sync server', socket.id);
      socket.emit('room:join', roomId);
    });

    socket.on('cursor:update', (data: CursorPulse) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.id]: data,
      }));
    });

    socket.on('cursor:leave', (data: { id: string }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[data.id];
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Method to send cursor position
  const emitCursorMove = useCallback((pulse: Omit<CursorPulse, 'id' | 'timestamp'>) => {
    if (socketRef.current?.connected) {
      const fullPulse: Omit<CursorPulse, 'id'> & { roomId: string; timestamp: number } = {
        ...pulse,
        roomId,
        timestamp: Date.now(),
      };
      socketRef.current.emit('cursor:move', fullPulse);
    }
  }, [roomId]);

  return {
    remoteCursors: Object.values(remoteCursors),
    emitCursorMove,
  };
}

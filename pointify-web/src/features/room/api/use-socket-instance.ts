import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';
import type { StoredParticipant } from '../utils/participant-session';

export type SocketConnectionStatus = 'connected' | 'connecting' | 'disconnected';

/**
 * Manages the singleton Socket.IO instance and connection lifecycle.
 * Handles connect/disconnect/error events, auto-joins on (re)connect.
 */
export function useSocketInstance(
  roomId: string,
  participantRef: React.RefObject<StoredParticipant | null>,
) {
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>('connecting');

  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      const socket = io(env.VITE_API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;
    }
    return socketRef.current;
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    const handleConnect = () => {
      setConnectionStatus('connected');
      const currentParticipant = participantRef.current;
      if (currentParticipant) {
        socket.emit('room:join', {
          roomId,
          participant: currentParticipant,
        });
      }
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleConnectError = (error: Error) => {
      console.warn('WebSocket connection error:', error.message);
      setConnectionStatus('disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Initial trigger if already connected
    const currentParticipant = participantRef.current;
    if (socket.connected && currentParticipant) {
      socket.emit('room:join', {
        roomId,
        participant: currentParticipant,
      });
      setConnectionStatus('connected');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [roomId, getSocket, participantRef]);

  return { getSocket, connectionStatus };
}

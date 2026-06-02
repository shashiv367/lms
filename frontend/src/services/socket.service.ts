import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config/constants';

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getMeetingSocket(token: string): Socket {
  if (socket && currentToken === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(`${SOCKET_URL}/meeting`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}

export function getSocket(): Socket | null {
  return socket;
}

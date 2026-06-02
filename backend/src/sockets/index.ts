import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env.config.js';
import { redisPub, redisSub } from '../config/redis.config.js';
import { roomManager } from '../mediasoup/RoomManager.js';
import { registerMeetingHandlers } from './meeting.socket.js';
import { logger } from '../utils/logger.js';

export function initSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, env.ADMIN_URL],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.adapter(createAdapter(redisPub, redisSub));

  const meetingNs = io.of('/meeting');
  roomManager.setSocketServer(meetingNs);
  registerMeetingHandlers(meetingNs);

  logger.info('Socket.IO initialized on /meeting namespace');
  return io;
}

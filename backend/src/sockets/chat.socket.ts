import { Socket } from 'socket.io';
import { ChatMessage } from '../models/ChatMessage.model.js';
import mongoose from 'mongoose';

export function registerChatHandlers(socket: Socket): void {
  socket.on(
    'send-message',
    async (payload: {
      meetingId: string;
      message: string;
      type?: 'text' | 'file' | 'system';
    }) => {
      try {
        const userId = socket.data.userId as string;
        const meetingId = payload.meetingId;
        if (!userId || !meetingId) {
          socket.emit('error', { code: 'CHAT_FAILED', message: 'Join the meeting first' });
          return;
        }

        const name = (socket.data.displayName as string) || 'Guest';

        const msg = await ChatMessage.create({
          meetingId,
          senderId: new mongoose.Types.ObjectId(userId),
          senderName: name,
          message: payload.message.slice(0, 2000),
          type: payload.type ?? 'text',
        });

        const formatted = {
          _id: msg._id.toString(),
          meetingId: msg.meetingId,
          senderId: msg.senderId.toString(),
          senderName: msg.senderName,
          message: msg.message,
          type: msg.type,
          isDeleted: msg.isDeleted,
          createdAt: msg.createdAt.toISOString(),
        };

        socket.to(meetingId).emit('new-message', { message: formatted });
        socket.emit('new-message', { message: formatted });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        socket.emit('error', { code: 'CHAT_FAILED', message });
      }
    }
  );
}

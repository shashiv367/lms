'use client';

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';
interface ChatInputProps {
  meetingId: string;
  senderName: string;
}

export function ChatInput({ meetingId, senderName: _senderName }: ChatInputProps) {
  const [text, setText] = useState('');
  const token = useAuthStore((s) => s.accessToken);
  const send = () => {
    const body = text.trim();
    if (!body || !token) return;

    const socket = getMeetingSocket(token);
    socket.emit('send-message', {
      meetingId,
      message: body,
      type: 'text',
    });
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex gap-2 border-t border-sky-100 p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        rows={2}
        className="flex-1 resize-none rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
      />
      <Button size="icon" onClick={send} disabled={!text.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

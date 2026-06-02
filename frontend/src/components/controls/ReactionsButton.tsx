'use client';

import { Smile } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmojiPicker } from '@/components/reactions/EmojiPicker';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

interface ReactionsButtonProps {
  meetingId: string;
}

export function ReactionsButton({ meetingId }: ReactionsButtonProps) {
  const [open, setOpen] = useState(false);
  const token = useAuthStore((s) => s.accessToken);
  const addReaction = useUiStore((s) => s.addReaction);

  const send = (emoji: string) => {
    getMeetingSocket(token ?? '').emit('send-reaction', { meetingId, emoji });
    addReaction({ peerId: 'local', displayName: 'You', emoji });
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="secondary" size="icon" onClick={() => setOpen(!open)}>
        <Smile className="h-5 w-5" />
      </Button>
      {open && <EmojiPicker onSelect={send} onClose={() => setOpen(false)} />}
    </div>
  );
}

'use client';

import { X } from 'lucide-react';
import { ParticipantItem } from './ParticipantItem';
import { useUiStore } from '@/store/uiStore';
import { useParticipantStore } from '@/store/participantStore';
import { useMeetingStore } from '@/store/meetingStore';

interface ParticipantsPanelProps {
  meetingId: string;
}

export function ParticipantsPanel({ meetingId: _meetingId }: ParticipantsPanelProps) {
  const toggleParticipants = useUiStore((s) => s.toggleParticipants);
  const peers = useParticipantStore((s) => s.peers);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const count = peers.size + (localPeer ? 1 : 0);

  return (
    <aside className="flex w-80 flex-col border-l border-zinc-800 bg-zinc-900/95">
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <h3 className="font-semibold text-white">Participants ({count})</h3>
        <button type="button" onClick={toggleParticipants} className="text-zinc-400">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {localPeer && (
          <ParticipantItem peer={localPeer} isLocal />
        )}
        {Array.from(peers.values()).map((p) => (
          <ParticipantItem key={p.peerId} peer={p} />
        ))}
      </div>
    </aside>
  );
}

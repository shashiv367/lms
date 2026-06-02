'use client';

import { X } from 'lucide-react';
import { ParticipantItem } from './ParticipantItem';
import { useUiStore } from '@/store/uiStore';
import { useParticipantStore } from '@/store/participantStore';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

interface ParticipantsPanelProps {
  meetingId: string;
}

export function ParticipantsPanel({ meetingId }: ParticipantsPanelProps) {
  const toggleParticipants = useUiStore((s) => s.toggleParticipants);
  const peers = useParticipantStore((s) => s.peers);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const accessToken = useAuthStore((s) => s.accessToken);
  const count = peers.size + (localPeer ? 1 : 0);
  const isHost = localPeer?.role === 'host' || localPeer?.role === 'co-host';

  const waitingPeers = Array.from(peers.values()).filter((p) => p.waiting);
  const activePeers = Array.from(peers.values()).filter((p) => !p.waiting);

  const admit = (peerId: string) => {
    if (!accessToken) return;
    getMeetingSocket(accessToken).emit('admit-from-waiting', {
      meetingId,
      targetPeerId: peerId,
    });
  };

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
        {isHost && waitingPeers.length > 0 && (
          <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Waiting room ({waitingPeers.length})
            </p>
            <div className="space-y-2">
              {waitingPeers.map((p) => (
                <div key={p.peerId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <ParticipantItem peer={p} />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => admit(p.peerId)}
                  >
                    Admit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePeers.map((p) => (
          <ParticipantItem key={p.peerId} peer={p} />
        ))}
      </div>
    </aside>
  );
}

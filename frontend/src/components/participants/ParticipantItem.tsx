import { Mic, MicOff, Video, VideoOff, Hand } from 'lucide-react';
import type { PeerInfo } from '@/types/shared-types';

interface ParticipantItemProps {
  peer: PeerInfo;
  isLocal?: boolean;
}

export function ParticipantItem({ peer, isLocal }: ParticipantItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-white">
        {peer.displayName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-white">
          {peer.displayName}
          {isLocal ? ' (You)' : ''}
        </p>
        {peer.role === 'host' && (
          <p className="text-xs text-amber-400">Host</p>
        )}
      </div>
      <div className="flex gap-1 text-zinc-400">
        {peer.micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-400" />}
        {peer.cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        {peer.handRaised && <Hand className="h-4 w-4 text-yellow-400" />}
      </div>
    </div>
  );
}

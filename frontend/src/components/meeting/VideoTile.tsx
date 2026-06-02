'use client';

import { useEffect, useRef } from 'react';
import { MicOff, Hand, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RemotePeer } from '@/types/participant.types';
import type { PeerInfo } from '@/types/shared-types';

interface VideoTileProps {
  peer: RemotePeer | (PeerInfo & { stream?: MediaStream });
  isLocal?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
}

export function VideoTile({ peer, isLocal, isPinned, onPin }: VideoTileProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const stream = 'stream' in peer ? peer.stream : undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm',
        isPinned && 'ring-2 ring-blue-500'
      )}
      onClick={onPin}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPin?.()}
    >
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn('h-full w-full object-cover', isLocal && 'scale-x-[-1]')}
        />
      ) : (
        <div className="flex h-full min-h-[120px] items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl font-semibold text-sky-800">
            {peer.displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <span className="rounded bg-black/60 px-2 py-0.5 text-xs text-white">
          {peer.displayName}
          {isLocal ? ' (You)' : ''}
        </span>
        {peer.role === 'host' && <Crown className="h-4 w-4 text-amber-400" />}
        {!peer.micEnabled && <MicOff className="h-4 w-4 text-red-400" />}
        {peer.handRaised && <Hand className="h-4 w-4 text-yellow-400" />}
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { VideoTile } from './VideoTile';
import { useParticipantStore } from '@/store/participantStore';
import { useMediaStore } from '@/store/mediaStore';
import { useMeetingStore } from '@/store/meetingStore';
import { useUiStore } from '@/store/uiStore';
import { useVideoGrid } from '@/hooks/useVideoGrid';
import type { RemotePeer } from '@/types/participant.types';

export function VideoGrid() {
  const peers = useParticipantStore((s) => s.peers);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const localStream = useMediaStore((s) => s.localStream);
  const localPeerId = useMeetingStore((s) => s.localPeerId);
  const pinnedPeerId = useUiStore((s) => s.pinnedPeerId);
  const pinPeer = useUiStore((s) => s.pinPeer);
  const isScreenSharing = useMediaStore((s) => s.isScreenSharing);
  const screenStream = useMediaStore((s) => s.screenStream);

  const allPeers = useMemo(() => {
    const byId = new Map<string, RemotePeer | (typeof localPeer & { stream?: MediaStream })>();

    if (localPeer && localPeerId) {
      byId.set(localPeerId, {
        ...localPeer,
        peerId: localPeerId,
        stream: localStream ?? undefined,
      });
    }

    for (const peer of peers.values()) {
      if (peer.peerId !== localPeerId) {
        byId.set(peer.peerId, peer);
      }
    }

    return Array.from(byId.values());
  }, [peers, localPeer, localPeerId, localStream]);

  const { cols } = useVideoGrid(allPeers.length);

  if (isScreenSharing && screenStream) {
    return (
      <div className="flex flex-1 gap-2 p-2">
        <div className="w-3/4">
          <video
            autoPlay
            playsInline
            muted
            ref={(el) => {
              if (el) el.srcObject = screenStream;
            }}
            className="h-full w-full rounded-lg object-contain bg-black"
          />
        </div>
        <div className="flex w-1/4 flex-col gap-2 overflow-y-auto">
          {allPeers.map((p) => (
            <VideoTile
              key={p.peerId}
              peer={p}
              isLocal={p.peerId === localPeerId}
              isPinned={pinnedPeerId === p.peerId}
              onPin={() => pinPeer(pinnedPeerId === p.peerId ? null : p.peerId)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid flex-1 gap-2 p-4"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {allPeers.map((p) => (
        <VideoTile
          key={p.peerId}
          peer={p}
          isLocal={p.peerId === localPeerId}
          isPinned={pinnedPeerId === p.peerId}
          onPin={() => pinPeer(pinnedPeerId === p.peerId ? null : p.peerId)}
        />
      ))}
    </div>
  );
}

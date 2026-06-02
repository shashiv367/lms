'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TopBar } from './TopBar';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from '@/components/controls/ControlBar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ParticipantsPanel } from '@/components/participants/ParticipantsPanel';
import { WaitingRoom } from './WaitingRoom';
import { ReactionOverlay } from '@/components/reactions/ReactionOverlay';
import { useMediasoup } from '@/hooks/useMediasoup';
import { useMeetingStore } from '@/store/meetingStore';
import { meetingService } from '@/services/meeting.service';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

interface MeetingRoomProps {
  meetingId: string;
}

export function MeetingRoom({ meetingId }: MeetingRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayName = searchParams.get('name') ?? 'Guest';
  const { joinRoom, leaveRoom } = useMediasoup(meetingId);
  const status = useMeetingStore((s) => s.status);
  const setMeeting = useMeetingStore((s) => s.setMeeting);
  const { isChatOpen, isParticipantsOpen } = useUiStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  useEffect(() => {
    meetingService.getById(meetingId).then(({ data }) => {
      if (data.success) setMeeting(data.data);
    });
  }, [meetingId, setMeeting]);

  useEffect(() => {
    if (!accessToken) {
      toast.error('Please sign in to join the meeting');
      router.replace('/login');
      return;
    }

    void joinRoom(displayName).catch(() => {});
    // Leave only via Leave button / tab close — not on React strict-mode remount
    const onUnload = () => leaveRoom();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [meetingId, displayName, joinRoom, leaveRoom, accessToken, router]);

  if (status === 'waiting') {
    return <WaitingRoom />;
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <TopBar meetingId={meetingId} />
      <div className="relative flex flex-1 overflow-hidden">
        <VideoGrid />
        {isChatOpen && <ChatPanel meetingId={meetingId} />}
        {isParticipantsOpen && <ParticipantsPanel meetingId={meetingId} />}
        <ReactionOverlay />
      </div>
      <ControlBar meetingId={meetingId} onLeave={leaveRoom} />
    </div>
  );
}

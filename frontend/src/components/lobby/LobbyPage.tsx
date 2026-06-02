'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PreviewVideo } from './PreviewVideo';
import { DeviceSelector } from './DeviceSelector';
import { useDevices } from '@/hooks/useDevices';
import { useLocalStream } from '@/hooks/useLocalStream';
import { useMediaStore } from '@/store/mediaStore';
import { useAuthStore } from '@/store/authStore';
import { meetingService } from '@/services/meeting.service';
import type { Meeting } from '@/types/shared-types';

interface LobbyPageProps {
  meetingId: string;
}

export function LobbyPage({ meetingId }: LobbyPageProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const { availableDevices } = useDevices();
  const { localStream, startPreview } = useLocalStream();
  const {
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    selectedCamera,
    selectedMic,
    setSelectedCamera,
    setSelectedMic,
  } = useMediaStore();

  useEffect(() => {
    meetingService.getById(meetingId).then(({ data }) => {
      if (data.success) setMeeting(data.data);
    });
    void startPreview();
  }, [meetingId, startPreview]);

  useEffect(() => {
    if (selectedCamera || selectedMic) void startPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-preview when device changes
  }, [selectedCamera, selectedMic]);

  return (
    <div className="flex min-h-screen flex-col bg-sky-50 md:flex-row">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-sky-100 bg-white shadow-lg">
          <PreviewVideo stream={localStream} />
        </div>
      </div>
      <div className="flex w-full flex-col justify-center gap-6 border-t border-sky-100 bg-white p-8 md:w-96 md:border-l md:border-t-0">
        <div>
          <p className="text-sm text-slate-500">Meeting ID</p>
          <p className="font-mono text-lg text-slate-900">{meetingId}</p>
          {meeting && (
            <p className="mt-1 text-slate-600">{meeting.title}</p>
          )}
        </div>
        <div>
          <Label>Display name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1"
          />
        </div>
        <DeviceSelector
          label="Camera"
          devices={availableDevices.cameras}
          value={selectedCamera}
          onChange={setSelectedCamera}
        />
        <DeviceSelector
          label="Microphone"
          devices={availableDevices.mics}
          value={selectedMic}
          onChange={setSelectedMic}
        />
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={toggleMic}>
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleCamera}>
            {isCameraOn ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>
        </div>
        <Button
          size="lg"
          onClick={() => {
            if (!accessToken) {
              toast.error('Please sign in to join the meeting');
              router.push('/login');
              return;
            }
            router.push(`/meeting/${meetingId}?name=${encodeURIComponent(displayName)}`);
          }}
          disabled={!displayName.trim()}
        >
          Join Now
        </Button>
      </div>
    </div>
  );
}

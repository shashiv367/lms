'use client';

import { useEffect, useState } from 'react';
import { Copy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useMeetingStore } from '@/store/meetingStore';
import { useParticipantStore } from '@/store/participantStore';
import { formatDuration } from '@/lib/utils';
import { APP_NAME } from '@/config/constants';
import { meetingService } from '@/services/meeting.service';
import { useAuthStore } from '@/store/authStore';
import { InviteOthers } from './InviteOthers';
import { RecordButton } from '@/components/controls/RecordButton';
import { useRecordingStore } from '@/store/recordingStore';

interface TopBarProps {
  meetingId: string;
}

export function TopBar({ meetingId }: TopBarProps) {
  const meeting = useMeetingStore((s) => s.meeting);
  const peers = useParticipantStore((s) => s.peers);
  const [seconds, setSeconds] = useState(0);
  const isRecording = useRecordingStore((s) => s.isRecording);
  const isUploading = useRecordingStore((s) => s.isUploading);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const copyId = () => {
    void navigator.clipboard.writeText(meetingId);
    toast.success('Meeting ID copied');
  };

  const endMeeting = async () => {
    try {
      await meetingService.end(meetingId);
      toast.success('Meeting ended');
    } catch {
      toast.error('Could not end meeting');
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-sky-100 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-sky-700">{APP_NAME}</span>
        <span className="text-slate-600">{meeting?.title}</span>
        {(isRecording || isUploading) && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isRecording
                ? 'bg-red-50 text-red-700'
                : 'bg-sky-50 text-sky-700'
            }`}
            title={isRecording ? 'Recording in progress' : 'Uploading recording'}
          >
            {isRecording ? 'REC' : 'Uploading…'}
          </span>
        )}
        <button
          type="button"
          onClick={copyId}
          className="flex items-center gap-1 font-mono text-sm text-slate-500 hover:text-sky-700"
        >
          {meetingId}
          <Copy className="h-3 w-3" />
        </button>
      </div>
      <span className="font-mono text-slate-600">{formatDuration(seconds)}</span>
      <div className="flex items-center gap-3">
        <RecordButton meetingId={meetingId} />
        <InviteOthers meetingId={meetingId} />
        <span className="flex items-center gap-1 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          {peers.size + 1}
        </span>
        {/* Removed top "End" button to avoid duplicate end/leave controls */}
      </div>
    </header>
  );
}

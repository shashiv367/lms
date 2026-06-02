'use client';

import { useEffect, useRef } from 'react';
import { Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecordingStore } from '@/store/recordingStore';
import { toast } from 'sonner';
import { useMeetingStore } from '@/store/meetingStore';

interface RecordButtonProps {
  meetingId: string;
}

function pickMimeType(): string | undefined {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=opus',
    'video/webm',
  ];
  return candidates.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t));
}

export function RecordButton({ meetingId }: RecordButtonProps) {
  const isRecording = useRecordingStore((s) => s.isRecording);
  const isUploading = useRecordingStore((s) => s.isUploading);
  const setRecording = useRecordingStore((s) => s.setRecording);
  const setUploading = useRecordingStore((s) => s.setUploading);
  const meetingStatus = useMeetingStore((s) => s.status);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const download = (blob: Blob, durationMs: number) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meetingId}-${new Date().toISOString().replaceAll(':', '-')}-${Math.max(
      1,
      Math.round(durationMs / 1000)
    )}s.webm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const start = async () => {
    if (isRecording || isUploading) return;
    if (meetingStatus === 'ended') {
      toast.error('Meeting has ended');
      return;
    }

    const display = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true, // system audio (browser permission-dependent)
    });

    // Mic audio (always ask separately so we can mix)
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Mix display audio + mic into a single track (best compatibility)
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();
    const sources: MediaStreamAudioSourceNode[] = [];

    const addAudio = (stream: MediaStream) => {
      const track = stream.getAudioTracks()[0];
      if (!track) return;
      const src = ctx.createMediaStreamSource(new MediaStream([track]));
      src.connect(dest);
      sources.push(src);
    };

    addAudio(display);
    addAudio(mic);

    const videoTrack = display.getVideoTracks()[0];
    if (!videoTrack) throw new Error('No screen video track');

    const mixed = new MediaStream([videoTrack, ...dest.stream.getAudioTracks()]);

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(mixed, mimeType ? { mimeType } : undefined);

    chunksRef.current = [];
    startedAtRef.current = Date.now();

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const durationMs = Date.now() - startedAtRef.current;
      const blob = new Blob(chunksRef.current, { type: mimeType ?? 'video/webm' });
      chunksRef.current = [];

      cleanupRef.current?.();
      cleanupRef.current = null;

      // No DB / backend upload. Download locally.
      setUploading(true);
      try {
        download(blob, durationMs);
        toast.success('Recording downloaded');
      } finally {
        setUploading(false);
      }
    };

    cleanupRef.current = () => {
      display.getTracks().forEach((t) => t.stop());
      mic.getTracks().forEach((t) => t.stop());
      sources.forEach((s) => s.disconnect());
      dest.disconnect();
      ctx.close().catch(() => {});
    };

    recorderRef.current = recorder;
    recorder.start(1000);
    setRecording(true);
  };

  const stop = () => {
    const r = recorderRef.current;
    if (!r || r.state === 'inactive') return;
    setRecording(false);
    r.stop();
    recorderRef.current = null;
  };

  useEffect(() => {
    if (meetingStatus === 'ended') stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingStatus]);

  return (
    <Button
      variant={isRecording ? 'destructive' : 'secondary'}
      size="icon"
      onClick={() => void (isRecording ? stop() : start())}
      disabled={isUploading}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
    </Button>
  );
}


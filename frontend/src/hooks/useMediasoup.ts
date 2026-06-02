'use client';

import { useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import type { Transport, Producer, Consumer } from 'mediasoup-client/types';
import { getDevice, resetDevice } from '@/lib/mediasoupClient';
import { getMeetingSocket } from '@/services/socket.service';
import { useMeetingStore } from '@/store/meetingStore';
import { useParticipantStore } from '@/store/participantStore';
import { useMediaStore } from '@/store/mediaStore';
import { useAuthStore } from '@/store/authStore';
import type { RoomJoinedEvent, NewProducerEvent } from '@/types/socket.types';

type RouterRtpCapabilities = Parameters<ReturnType<typeof getDevice>['load']>[0]['routerRtpCapabilities'];
type IceParameters = Parameters<ReturnType<typeof getDevice>['createSendTransport']>[0]['iceParameters'];
type IceCandidates = Parameters<ReturnType<typeof getDevice>['createSendTransport']>[0]['iceCandidates'];
type DtlsParameters = Parameters<ReturnType<typeof getDevice>['createSendTransport']>[0]['dtlsParameters'];

function emitAck<T>(
  socket: Socket,
  event: string,
  payload: Record<string, unknown>
): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (response: T & { error?: { message: string } }) => {
      if (response && typeof response === 'object' && 'error' in response && response.error) {
        reject(new Error(response.error.message));
      } else {
        resolve(response);
      }
    });
  });
}

async function ensureLiveLocalStream(): Promise<MediaStream> {
  const { localStream, setLocalStream } = useMediaStore.getState();
  const tracksLive =
    localStream?.getTracks().length &&
    localStream.getTracks().every((t) => t.readyState === 'live');

  if (localStream && tracksLive) return localStream;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  setLocalStream(stream);
  return stream;
}

export function useMediasoup(meetingId: string) {
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<string, Producer>>(new Map());
  const consumersRef = useRef<Map<string, Consumer>>(new Map());
  const joiningRef = useRef(false);

  const { setStatus, setLocalPeerId } = useMeetingStore();
  const { addPeer, removePeer, updatePeer, setLocalPeer, setPeerStream } =
    useParticipantStore();
  const { localStream, isScreenSharing, stopScreenShare } = useMediaStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  const leaveRoom = useCallback(() => {
    joiningRef.current = false;
    const socket = getMeetingSocket(accessToken ?? '');
    socket.emit('leave-room', { meetingId });
    socket.off('new-producer');
    socket.off('producer-closed');
    socket.off('peer-joined');
    socket.off('peer-left');
    socket.off('peer-state-updated');
    socket.off('meeting-ended');
    sendTransportRef.current?.close();
    recvTransportRef.current?.close();
    producersRef.current.forEach((p) => p.close());
    consumersRef.current.forEach((c) => c.close());
    producersRef.current.clear();
    consumersRef.current.clear();
    resetDevice();
    useParticipantStore.getState().reset();
    setStatus('idle');
  }, [meetingId, accessToken, setStatus]);

  const consumeProducer = useCallback(
    async (socket: Socket, producerId: string, peerId: string) => {
      const device = getDevice();
      const recvTransport = recvTransportRef.current;
      if (!recvTransport || !device.loaded) return;

      const data = await emitAck<{
        id: string;
        producerId: string;
        kind: 'audio' | 'video';
        rtpParameters: Parameters<Transport['consume']>[0]['rtpParameters'];
      }>(socket, 'consume', {
        meetingId,
        producerId,
        rtpCapabilities: device.rtpCapabilities,
      });

      const consumer = await recvTransport.consume({
        id: data.id,
        producerId: data.producerId,
        kind: data.kind,
        rtpParameters: data.rtpParameters,
      });

      await emitAck(socket, 'resume-consumer', {
        meetingId,
        consumerId: consumer.id,
      });

      consumersRef.current.set(consumer.id, consumer);

      const stream = new MediaStream([consumer.track]);
      const peer = useParticipantStore.getState().peers.get(peerId);
      if (consumer.appData?.source === 'screen') {
        updatePeer(peerId, { screenStream: stream, isScreenSharing: true });
      } else {
        const existing = peer?.stream;
        if (existing) {
          existing.addTrack(consumer.track);
          setPeerStream(peerId, existing);
        } else {
          setPeerStream(peerId, stream);
        }
      }
    },
    [meetingId, setPeerStream, updatePeer]
  );

  const joinRoom = useCallback(
    async (displayName: string) => {
      if (!accessToken) {
        setStatus('idle');
        return;
      }
      if (joiningRef.current) return;
      joiningRef.current = true;
      setStatus('connecting');

      try {
      const socket = getMeetingSocket(accessToken);
      socket.off('new-producer');
      socket.off('producer-closed');
      socket.off('peer-joined');
      socket.off('peer-left');
      socket.off('peer-state-updated');
      socket.off('meeting-ended');
      const device = getDevice();

      const joined = await emitAck<RoomJoinedEvent>(socket, 'join-room', {
        meetingId,
        token: accessToken,
        displayName,
      });

      if (joined.waiting) {
        setStatus('waiting');
        setLocalPeerId(joined.peerId);
        return;
      }

      await device.load({
        routerRtpCapabilities: joined.rtpCapabilities as RouterRtpCapabilities,
      });
      setLocalPeerId(joined.peerId);
      setLocalPeer({
        peerId: joined.peerId,
        userId: useAuthStore.getState().user?._id ?? '',
        displayName,
        role: 'participant',
        micEnabled: true,
        cameraEnabled: true,
        handRaised: false,
        isScreenSharing: false,
      });

      joined.peers.forEach((p) => addPeer(p));

      const sendData = await emitAck<{
        id: string;
        iceParameters: IceParameters;
        iceCandidates: IceCandidates;
        dtlsParameters: DtlsParameters;
      }>(socket, 'create-transport', { meetingId, direction: 'send' });

      const sendTransport = device.createSendTransport({
        id: sendData.id,
        iceParameters: sendData.iceParameters,
        iceCandidates: sendData.iceCandidates,
        dtlsParameters: sendData.dtlsParameters,
      });
      sendTransportRef.current = sendTransport;

      sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        emitAck(socket, 'connect-transport', {
          meetingId,
          transportId: sendTransport.id,
          dtlsParameters,
        })
          .then(() => callback())
          .catch(errback);
      });

      sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          const { producerId } = await emitAck<{ producerId: string }>(socket, 'produce', {
            meetingId,
            transportId: sendTransport.id,
            kind,
            rtpParameters,
            appData,
          });
          callback({ id: producerId });
        } catch (e) {
          errback(e as Error);
        }
      });

      const recvData = await emitAck<typeof sendData>(socket, 'create-transport', {
        meetingId,
        direction: 'recv',
      });

      const recvTransport = device.createRecvTransport({
        id: recvData.id,
        iceParameters: recvData.iceParameters,
        iceCandidates: recvData.iceCandidates,
        dtlsParameters: recvData.dtlsParameters,
      });
      recvTransportRef.current = recvTransport;

      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        emitAck(socket, 'connect-transport', {
          meetingId,
          transportId: recvTransport.id,
          dtlsParameters,
        })
          .then(() => callback())
          .catch(errback);
      });

      const stream = await ensureLiveLocalStream();
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      if (audioTrack?.readyState === 'live') {
        const p = await sendTransport.produce({ track: audioTrack });
        producersRef.current.set(p.id, p);
      }
      if (videoTrack?.readyState === 'live') {
        const p = await sendTransport.produce({ track: videoTrack });
        producersRef.current.set(p.id, p);
      }

      for (const prod of joined.existingProducers ?? []) {
        if (prod.kind === 'audio' || prod.kind === 'video') {
          await consumeProducer(socket, prod.producerId, prod.peerId);
        }
      }

      socket.on('new-producer', (data: NewProducerEvent) => {
        void consumeProducer(socket, data.producerId, data.peerId);
      });

      socket.on('producer-closed', ({ producerId, peerId }: { producerId: string; peerId: string }) => {
        for (const [id, consumer] of consumersRef.current) {
          if (consumer.producerId === producerId) {
            consumer.close();
            consumersRef.current.delete(id);
          }
        }
        updatePeer(peerId, { isScreenSharing: false });
      });

      socket.on('peer-joined', ({ peer }: { peer: Parameters<typeof addPeer>[0] }) => {
        const localId = useMeetingStore.getState().localPeerId;
        if (peer.peerId !== localId) addPeer(peer);
      });

      socket.on('peer-left', ({ peerId }: { peerId: string }) => {
        removePeer(peerId);
      });

      socket.on('peer-state-updated', (data: {
        peerId: string;
        micEnabled: boolean;
        cameraEnabled: boolean;
        handRaised: boolean;
      }) => {
        updatePeer(data.peerId, data);
      });

      socket.on('meeting-ended', () => {
        useMeetingStore.getState().endMeeting();
        setStatus('ended');
        leaveRoom();
      });

      setStatus('connected');
    } catch (err) {
      joiningRef.current = false;
      throw err;
    }
    },
    [
      accessToken,
      meetingId,
      addPeer,
      removePeer,
      updatePeer,
      setLocalPeer,
      setLocalPeerId,
      setStatus,
      consumeProducer,
      leaveRoom,
    ]
  );

  const startScreenShare = useCallback(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const transport = sendTransportRef.current;
    if (!transport) return;
    const producer = await transport.produce({
      track: stream.getVideoTracks()[0],
      appData: { source: 'screen' },
    });
    producersRef.current.set(producer.id, producer);
    stream.getVideoTracks()[0].onended = () => {
      producer.close();
      getMeetingSocket(accessToken ?? '').emit('screen-share-stop', { meetingId });
      stopScreenShare();
    };
    useMediaStore.getState().startScreenShare(stream);
    getMeetingSocket(accessToken ?? '').emit('screen-share-start', { meetingId });
  }, [meetingId, accessToken, stopScreenShare]);

  return { joinRoom, leaveRoom, startScreenShare, isScreenSharing };
}

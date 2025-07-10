import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (serverUrl: string = 'https://wboardcast-backend.llp.trizenventures.com') => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [serverUrl]);

  const joinCampaign = (campaignId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-campaign', campaignId);
    }
  };

  const leaveCampaign = (campaignId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-campaign', campaignId);
    }
  };

  const onCampaignStatusUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('campaign-status-update', callback);
    }
  };

  const onCampaignProgressUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('campaign-progress-update', callback);
    }
  };

  const onCampaignCompleted = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('campaign-completed', callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    joinCampaign,
    leaveCampaign,
    onCampaignStatusUpdate,
    onCampaignProgressUpdate,
    onCampaignCompleted,
    off
  };
};
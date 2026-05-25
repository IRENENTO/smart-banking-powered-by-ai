import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '../../utils/storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
  if (socket?.connected) return socket;

  const token = await tokenStorage.getAccessToken();

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const subscribeToDevice = (deviceId: string) => {
  socket?.emit('tracking:subscribe', { deviceId });
};

export const sendLocation = (data: {
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
  bearing?: number;
  batteryLevel?: number;
  networkType?: string;
  timestamp?: string;
}) => {
  socket?.emit('location:update', data);
};

export const triggerAlert = (data: {
  deviceId: string;
  type: string;
  severity?: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  metadata?: any;
}) => {
  socket?.emit('alert:trigger', data);
};

export const setDeviceOnline = (deviceId: string) => {
  socket?.emit('device:online', { deviceId });
};

export const setDeviceOffline = (deviceId: string) => {
  socket?.emit('device:offline', { deviceId });
};

export const onNewAlert = (callback: (alert: any) => void) => {
  socket?.on('alert:new', callback);
  return () => socket?.off('alert:new', callback);
};

export const onLocationBroadcast = (callback: (data: any) => void) => {
  socket?.on('location:broadcast', callback);
  return () => socket?.off('location:broadcast', callback);
};

export const onRiskUpdate = (callback: (data: any) => void) => {
  socket?.on('ai:risk-update', callback);
  return () => socket?.off('ai:risk-update', callback);
};

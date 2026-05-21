import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../constants';

let socket: Socket | null = null;

export const socketService = {
  connect: () => {
    if (socket) {
      return socket;
    }
    socket = io(API_CONFIG.BASE_URL.replace('/api', ''), {
      transports: ['websocket'],
      reconnectionAttempts: 3,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return socket;
  },
  on: (event: string, callback: (...args: any[]) => void) => {
    if (!socket) {
      socketService.connect();
    }
    socket?.on(event, callback);
  },
  emit: (event: string, payload?: any) => {
    socket?.emit(event, payload);
  },
  disconnect: () => {
    socket?.disconnect();
    socket = null;
  },
};

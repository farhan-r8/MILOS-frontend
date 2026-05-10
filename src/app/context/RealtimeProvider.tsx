import { useEffect, useRef, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../lib/api';

type RealtimeNotification = {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error';
  entity?: 'pickup' | 'transaction' | 'redemption' | 'general';
  payload?: Record<string, unknown> | null;
  createdAt: string;
};

const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { token, user, authReady } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!authReady || !token || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
    });

    socket.on('notification', (notification: RealtimeNotification) => {
      const showToast =
        notification.type === 'success'
          ? toast.success
          : notification.type === 'error'
          ? toast.error
          : toast;

      showToast(notification.title, {
        description: notification.message,
      });

      window.dispatchEvent(
        new CustomEvent('milos:realtime', {
          detail: notification,
        })
      );
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authReady, token, user]);

  return <>{children}</>;
}

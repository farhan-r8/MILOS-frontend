import { useEffect } from 'react';

type NotificationDetail = {
  entity?: string;
};

export function useRealtimeRefresh(enabled: boolean, onRefresh: () => void, entities: string[]) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationDetail>;
      const entity = customEvent.detail?.entity;

      if (!entity || entities.includes(entity)) {
        onRefresh();
      }
    };

    window.addEventListener('milos:realtime', handler);
    return () => {
      window.removeEventListener('milos:realtime', handler);
    };
  }, [enabled, entities, onRefresh]);
}

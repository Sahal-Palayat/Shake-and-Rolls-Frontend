import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_ORIGIN } from '@/features/api/client';
import { loadSession } from '@/features/auth/session';
import { ServerEvent } from '@/features/kitchen/events';

const POLL_MS = 15_000;

/**
 * Keeps a screen fresh: re-runs `load` when the server announces an order change, on reconnect, and every 15 s
 * while the page is visible. Polling is the safety net (socket blocked, phone asleep, no rider room on the server).
 * Returns whether the socket is currently connected.
 */
export function useLiveRefresh(load: () => void, enabled = true): boolean {
  const [isLive, setLive] = useState(false);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!enabled) return;
    const session = loadSession();
    if (!session) return;
    const run = () => loadRef.current();

    const socket = io(API_ORIGIN, { auth: { token: session.token }, reconnectionDelayMax: 10_000 });
    socket.on('connect', () => {
      setLive(true);
      run();
    });
    socket.on('disconnect', () => setLive(false));
    socket.on('connect_error', () => setLive(false));
    socket.on(ServerEvent.OrderStatusChanged, run);
    socket.on(ServerEvent.OrderCreated, run);

    const poll = setInterval(() => {
      if (!document.hidden) run();
    }, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) run();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      socket.removeAllListeners();
      socket.disconnect();
      setLive(false);
    };
  }, [enabled]);

  return isLive;
}

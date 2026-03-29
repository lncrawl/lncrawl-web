import { useEffect } from 'react';

export function useWakeLock() {
  useEffect(() => {
    // wake lock sentinel
    let wakeLock: WakeLockSentinel | undefined;

    // request wake lock
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch {
        // unsupported, denied, or not a secure context
      }
    };

    const releaseWakeLock = () => {
      try {
        if (wakeLock) {
          void wakeLock.release();
          wakeLock = undefined;
        }
      } catch {
        // ignore release errors
      }
    };

    // request wake lock on mount
    void requestWakeLock();

    // add visibility change listener
    const aborter = new AbortController();
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'visible') {
          void requestWakeLock();
        } else {
          void releaseWakeLock();
        }
      },
      {
        signal: aborter.signal,
      }
    );
    return () => {
      aborter.abort();
      void releaseWakeLock(); // release wake lock on unmount
    };
  }, []);
}

import { useEffect, useState, useCallback } from "react";

export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  const start = useCallback((mins) => {
    setSeconds(mins * 60);
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setSeconds(0);
  }, []);

  return {
    seconds,
    running,
    start,
    stop
  };
}

export function formatTime(total) {
  const safeTotal = Math.max(0, Math.floor(Number(total) || 0));
  const m = Math.floor(safeTotal / 60).toString().padStart(2, "0");
  const s = Math.floor(safeTotal % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
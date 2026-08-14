import { useEffect, useState } from "react";

export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;
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
  }, [running, seconds]);

  return {
    seconds,
    running,
    start: mins => { setSeconds(mins * 60); setRunning(true); },
    stop: () => { setRunning(false); setSeconds(0); }
  };
}

export function formatTime(total) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
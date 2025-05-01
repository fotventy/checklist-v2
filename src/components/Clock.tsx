'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!currentTime) {
    return <div className="text-2xl font-bold">&nbsp;</div>;
  }

  return (
    <div className="text-2xl font-bold">
      {currentTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })}
    </div>
  );
} 
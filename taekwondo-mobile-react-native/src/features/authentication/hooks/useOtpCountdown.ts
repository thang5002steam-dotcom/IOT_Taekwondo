import { useEffect, useMemo, useState } from 'react';

function millisecondsUntil(value?: string): number {
  if (!value) return 0;
  return Math.max(0, new Date(value).getTime() - Date.now());
}

export function useOtpCountdown(resendAvailableAt?: string, expiresAt?: string) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!resendAvailableAt && !expiresAt) return undefined;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [expiresAt, resendAvailableAt]);

  return useMemo(() => {
    const resendSeconds = Math.ceil(millisecondsUntil(resendAvailableAt) / 1_000);
    const expirySeconds = Math.ceil(millisecondsUntil(expiresAt) / 1_000);
    const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    return {
      canResend: resendSeconds <= 0,
      expired: Boolean(expiresAt) && expirySeconds <= 0,
      resendLabel: resendSeconds > 0 ? `Gửi lại sau ${format(resendSeconds)}` : 'Gửi lại mã',
      expiresLabel: expirySeconds > 0 ? `Mã còn hiệu lực ${format(expirySeconds)}` : 'Mã đã hết hạn',
    };
  }, [expiresAt, now, resendAvailableAt]);
}

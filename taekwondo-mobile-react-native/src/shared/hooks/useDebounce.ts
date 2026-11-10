import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cài đặt một bộ đếm giờ, sau 'delay' mili-giây mới cập nhật value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nếu người dùng gõ tiếp trước khi hết giờ, hủy bộ đếm cũ đi
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

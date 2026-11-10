import type { ToastContextValue } from '@/shared/ui/Toast';

/**
 * Hiển thị toast thông báo tính năng đang phát triển.
 *
 * Tái sử dụng ở bất kỳ đâu trong app khi một tính năng chưa sẵn sàng:
 *
 * ```tsx
 * const toast = useToast();
 * showComingSoon(toast);
 * ```
 */
export function showComingSoon(toast: ToastContextValue): void {
  toast.show({
    message: 'Tính năng này sẽ sớm được ra mắt trong phiên bản tới',
    variant: 'info',
    duration: 3000,
  });
}

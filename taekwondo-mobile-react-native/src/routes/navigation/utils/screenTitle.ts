import { useLocalSearchParams } from 'expo-router';

export type TitleSource = string | Record<string, unknown> | null | undefined;

export interface DetailTitleOptions {
  /**
   * Fallback title to display when entity name is not yet loaded or missing.
   * Note: Any "Chi tiết " prefix will be automatically stripped and capitalized.
   * E.g. "Khóa học", "Học viên", "Người dùng".
   */
  fallback?: string;
  /**
   * Optional route parameter (from useLocalSearchParams) to show immediately
   * during page transitions before remote query data arrives.
   */
  routeTitle?: string | null;
  /**
   * Custom property name to extract from entity if not in standard list.
   */
  key?: string;
  /**
   * Max characters before truncating (default: 40).
   */
  maxLength?: number;
}

const COMMON_TITLE_KEYS = [
  'courseName',
  'fullName',
  'displayName',
  'name',
  'title',
  'label',
] as const;

const STRIP_DETAIL_PREFIX_REGEX = /^(chi tiết\s*:\s*|chi tiết\s+)/i;

function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Thuật toán giải quyết tiêu đề màn hình từ entity, chuỗi trực tiếp hoặc fallback.
 * Tự động trích xuất tên chính của đối tượng và loại bỏ các tiền tố tĩnh "Chi tiết...".
 */
export function resolveDetailTitle(
  source: TitleSource,
  options?: DetailTitleOptions,
): string {
  let resolved: string | undefined;

  // 1. Nếu source là string trực tiếp
  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (trimmed.length > 0) {
      resolved = trimmed;
    }
  } else if (source && typeof source === 'object') {
    // 2. Nếu là object: kiểm tra key tùy biến trước (nếu có)
    if (options?.key) {
      const customVal = source[options.key];
      if (typeof customVal === 'string' && customVal.trim().length > 0) {
        resolved = customVal.trim();
      }
    }

    // Nếu chưa tìm thấy, duyệt danh sách key chuẩn của dự án theo thứ tự ưu tiên
    if (!resolved) {
      for (const k of COMMON_TITLE_KEYS) {
        const val = source[k];
        if (typeof val === 'string' && val.trim().length > 0) {
          resolved = val.trim();
          break;
        }
      }
    }
  }

  // 3. Fallback sang routeTitle (navigation parameter) để hiển thị tức thì không chờ API
  if (!resolved && options?.routeTitle && typeof options.routeTitle === 'string') {
    const trimmedRoute = options.routeTitle.trim();
    if (trimmedRoute.length > 0) {
      resolved = trimmedRoute;
    }
  }

  // 4. Fallback sang nhãn danh mục nếu entity chưa có dữ liệu
  if (!resolved && options?.fallback) {
    const stripped = options.fallback.replace(STRIP_DETAIL_PREFIX_REGEX, '').trim();
    resolved = capitalizeFirstLetter(stripped);
  }

  // 5. Chuẩn hóa khoảng trắng
  let finalTitle = (resolved ?? '').replace(/\s+/g, ' ').trim();

  // 6. Truncate an toàn nếu vượt quá maxLength
  const max = options?.maxLength ?? 40;
  if (finalTitle.length > max) {
    finalTitle = `${finalTitle.slice(0, max - 1).trimEnd()}…`;
  }

  return finalTitle;
}

/**
 * Hook tiện ích tự động kết hợp route params (`title`) của Expo Router
 * để hiển thị tiêu đề tức thì trong lúc chờ API query.
 */
export function useDynamicDetailTitle(
  source: TitleSource,
  options?: DetailTitleOptions,
): string {
  const params = useLocalSearchParams<{ title?: string }>();
  return resolveDetailTitle(source, {
    routeTitle: options?.routeTitle ?? params.title,
    ...options,
  });
}

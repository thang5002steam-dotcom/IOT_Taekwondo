export const FACE_SCANNER_CONFIG = {
  /**
   * Minimum ratio of face bounding box area relative to frame area (0..1).
   * 0.01 allows face to be detected easily from normal handheld distance.
   */
  MIN_FACE_AREA_RATIO: 0.01,

  /**
   * Maximum ratio of face bounding box area relative to frame area (0..1).
   * 0.99 prevents blocking user when face fills the screen.
   */
  MAX_FACE_AREA_RATIO: 0.99,

  /**
   * Maximum allowed yaw angle in degrees (head turning left/right).
   */
  MAX_HEAD_YAW: 45,

  /**
   * Maximum allowed roll angle in degrees (head tilting sideways).
   */
  MAX_HEAD_ROLL: 45,

  /**
   * Maximum allowed pitch angle in degrees (head looking up/down).
   */
  MAX_HEAD_PITCH: 45,

  /**
   * Minimum duration in milliseconds that a valid face must remain stable before capture.
   * 1000ms (~1 second) ensures user is intentionally standing still for check-in rather than walking past.
   */
  STABILITY_DURATION_MS: 1000,

  /**
   * Minimum number of consecutive frames required for stability check.
   */
  STABILITY_MIN_FRAMES: 3,

  /**
   * Maximum normalized coordinate drift relative to face size to be considered stable.
   */
  MAX_POSITION_DRIFT_RATIO: 0.40,

  /**
   * Cooldown period after completing a check-in before next scan can be triggered.
   */
  CAPTURE_COOLDOWN_MS: 1500,

  /**
   * Normalized region of the frame where face must be centered.
   * Full viewport [0..1] to accept any face visible in the camera frame.
   */
  SCAN_REGION: {
    minX: 0.0,
    maxX: 1.0,
    minY: 0.0,
    maxY: 1.0,
  },
} as const;

export const FACE_QUALITY_MESSAGES = {
  NO_FACE: 'Đang nhận diện...',
  MULTIPLE_FACES: 'Chỉ một người đứng trước camera',
  FACE_TOO_SMALL: 'Vui lòng lại gần camera hơn',
  FACE_TOO_LARGE: 'Vui lòng lùi xa camera một chút',
  FACE_OUT_OF_BOUNDS: 'Vui lòng đưa khuôn mặt vào giữa khung hình',
  FACE_ANGLE_BAD: 'Vui lòng nhìn thẳng vào camera',
  FACE_NOT_STABLE: 'Giữ yên khuôn mặt...',
  VALID: 'Đang xử lý...',
} as const;

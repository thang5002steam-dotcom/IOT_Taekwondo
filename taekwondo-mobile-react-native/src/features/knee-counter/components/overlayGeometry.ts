/** Coordinates of an object-fit: contain video inside the overlay canvas. */
export function videoContainRect(canvasWidth: number, canvasHeight: number, videoWidth: number, videoHeight: number) {
  const scale = Math.min(canvasWidth / Math.max(1, videoWidth), canvasHeight / Math.max(1, videoHeight));
  const width = videoWidth * scale;
  const height = videoHeight * scale;
  return { x: (canvasWidth - width) / 2, y: (canvasHeight - height) / 2, width, height };
}

export type StableOverlayLine = { y: number; updatedAtMs: number };

/** Smooth only the rendered guide. Counter geometry remains unfiltered. */
export function stabilizeOverlayLine(previous: StableOverlayLine | undefined, targetY: number, timestampMs: number): StableOverlayLine {
  if (!previous) return { y: targetY, updatedAtMs: timestampMs };
  const elapsedMs = Math.max(1, timestampMs - previous.updatedAtMs);
  const maxStep = Math.min(0.025, Math.max(0.004, elapsedMs * 0.00012));
  const nextY = previous.y + Math.max(-maxStep, Math.min(maxStep, (targetY - previous.y) * 0.18));
  return { y: nextY, updatedAtMs: timestampMs };
}

export type CountLabelPosition = { x: number; y: number; textAlign: CanvasTextAlign };

/** Place a count outside a tracked person's face, preferring the visual right side. */
export function countLabelPosition(
  bounds: { left: number; right: number; top: number; bottom: number },
  image: { x: number; y: number; width: number; height: number },
  fontSize: number,
  digitCount: number,
): CountLabelPosition {
  const padding = Math.max(12, Math.round(fontSize * 0.22));
  const halfLabelWidth = Math.max(fontSize * 0.42, digitCount * fontSize * 0.34);
  const imageLeft = image.x;
  const imageRight = image.x + image.width;
  const rightX = bounds.right + padding + halfLabelWidth;
  const leftX = bounds.left - padding - halfLabelWidth;
  const x = rightX + halfLabelWidth <= imageRight
    ? rightX
    : leftX - halfLabelWidth >= imageLeft
      ? leftX
      : Math.max(imageLeft + halfLabelWidth, Math.min(imageRight - halfLabelWidth, rightX));
  const y = Math.max(
    image.y + fontSize,
    Math.min(image.y + image.height - padding, bounds.top + (bounds.bottom - bounds.top) * 0.58 + fontSize * 0.32),
  );

  return { x, y, textAlign: "center" };
}

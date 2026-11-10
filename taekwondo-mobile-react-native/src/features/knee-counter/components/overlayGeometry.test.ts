import { countLabelPosition, stabilizeOverlayLine, videoContainRect } from "./overlayGeometry";

it("aligns a 16:9 camera image in a taller fullscreen frame", () => {
  expect(videoContainRect(1080, 1920, 1280, 720)).toEqual({ x: 0, y: 656.25, width: 1080, height: 607.5 });
});

it("fills a frame with the same aspect ratio", () => {
  expect(videoContainRect(640, 360, 1280, 720)).toEqual({ x: 0, y: 0, width: 640, height: 360 });
});

it("limits visual guide movement while preserving its initial position", () => {
  const first = stabilizeOverlayLine(undefined, 0.5, 1000);
  const moved = stabilizeOverlayLine(first, 0.8, 1016);
  expect(first.y).toBe(0.5);
  expect(moved.y).toBeGreaterThan(0.5);
  expect(moved.y).toBeLessThan(0.51);
});

it("places a participant count to the visual right of a face", () => {
  expect(countLabelPosition(
    { left: 120, right: 220, top: 80, bottom: 300 },
    { x: 0, y: 0, width: 640, height: 360 },
    72,
    2,
  ).x).toBeGreaterThan(220);
});

it("moves a participant count left when the right edge has no room", () => {
  expect(countLabelPosition(
    { left: 530, right: 630, top: 80, bottom: 300 },
    { x: 0, y: 0, width: 640, height: 360 },
    72,
    2,
  ).x).toBeLessThan(530);
});

it("keeps a count label within the contained video bounds", () => {
  const label = countLabelPosition(
    { left: 0, right: 25, top: 0, bottom: 80 },
    { x: 40, y: 20, width: 300, height: 170 },
    72,
    3,
  );
  expect(label.x).toBeGreaterThanOrEqual(40);
  expect(label.y).toBeGreaterThanOrEqual(92);
});

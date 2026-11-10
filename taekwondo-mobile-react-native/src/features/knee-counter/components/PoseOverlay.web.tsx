import { useEffect, useRef, useState } from "react";

import { legMeasurementReference, measurementKeypointIndex, MOVENET_KEYPOINT } from "../domain/kneeSignal";
import type { BoundingBox, CountingLandmark, KneeCounterSessionConfig, NormalizedPoint, ParticipantSlot } from "../types/kneeCounter.types";
import { countLabelPosition, stabilizeOverlayLine, videoContainRect } from "./overlayGeometry";

// MoveNet's first five keypoints describe the head (nose, eyes and ears).
const HEAD_KEYPOINTS = [0, 1, 2, 3, 4] as const;

export function overlayTargetKeypoints(landmark: CountingLandmark) {
  if (landmark === "ankle") return [
    MOVENET_KEYPOINT.leftHip,
    MOVENET_KEYPOINT.rightHip,
    MOVENET_KEYPOINT.leftKnee,
    MOVENET_KEYPOINT.rightKnee,
    MOVENET_KEYPOINT.leftAnkle,
    MOVENET_KEYPOINT.rightAnkle,
  ] as const;
  return [
    MOVENET_KEYPOINT.leftHip,
    MOVENET_KEYPOINT.rightHip,
    measurementKeypointIndex("left", landmark),
    measurementKeypointIndex("right", landmark),
  ] as const;
}

const isVisible = (point: NormalizedPoint | undefined): point is NormalizedPoint =>
  Boolean(point && point.score >= 0.10);

function fallbackBounds(points: NormalizedPoint[]): BoundingBox | null {
  if (!points.length) return null;
  return {
    xMin: Math.min(...points.map((point) => point.x)),
    yMin: Math.min(...points.map((point) => point.y)),
    xMax: Math.max(...points.map((point) => point.x)),
    yMax: Math.max(...points.map((point) => point.y)),
  };
}

export function PoseOverlay({
  slots,
  width,
  height,
  config,
  mirrored,
}: {
  slots: ParticipantSlot[];
  width: number;
  height: number;
  config: KneeCounterSessionConfig;
  mirrored: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointsRef = useRef(new Map<string, { point: NormalizedPoint; seenAt: number }>());
  const guideLinesRef = useRef(new Map<string, { y: number; updatedAtMs: number }>());
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => setSize({ width: canvas.clientWidth, height: canvas.clientHeight }));
    observer.observe(canvas);
    setSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasWidth = size.width || width;
    const canvasHeight = size.height || height;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const image = videoContainRect(canvasWidth, canvasHeight, width, height);
    const { width: imageWidth, height: imageHeight, x: offsetX, y: offsetY } = image;

    const toX = (x: number) => offsetX + (mirrored ? 1 - x : x) * imageWidth;
    const toY = (y: number) => offsetY + y * imageHeight;
    const dotRadius = Math.max(7, Math.round(Math.min(imageWidth, imageHeight) * 0.012));
    const targetKeypoints = overlayTargetKeypoints(config.measurementLandmark);

    slots.forEach((slot) => {
      const pose = slot.pose;
      if (!pose) return;
      const visiblePoints = pose.keypoints.filter(isVisible);
      const bounds = pose.boundingBox ?? fallbackBounds(visiblePoints);
      const hips = [pose.keypoints[MOVENET_KEYPOINT.leftHip], pose.keypoints[MOVENET_KEYPOINT.rightHip]].filter(isVisible);

      const references = (["left", "right"] as const)
        .map((leg) => legMeasurementReference(pose, leg, config))
        .filter((reference): reference is { hip: NormalizedPoint; shoulder: NormalizedPoint | null; torsoHeight: number } =>
          reference.hip !== null && reference.torsoHeight !== null && reference.torsoHeight >= 0.05,
        );
      if (config.measurementLandmark === "ankle" && slot.ankleGuide) {
        const horizontalPoints = [...hips, ...targetKeypoints.map((index) => pose.keypoints[index]).filter(isVisible)];
        if (horizontalPoints.length) {
          const xMin = Math.max(0, Math.min(...horizontalPoints.map((point) => point.x)) - .08); const xMax = Math.min(1, Math.max(...horizontalPoints.map((point) => point.x)) + .08);
          const x1 = toX(xMin); const x2 = toX(xMax);
          const drawGuide = (value: number, color: string, dashed: boolean) => { context.setLineDash(dashed ? [10, 7] : []); context.strokeStyle = color; context.lineWidth = dashed ? 3 : 4; context.beginPath(); context.moveTo(Math.min(x1, x2), toY(value)); context.lineTo(Math.max(x1, x2), toY(value)); context.stroke(); };
          drawGuide(slot.ankleGuide.countLineY, "#FACC15", false); drawGuide(slot.ankleGuide.resetLineY, "#38BDF8", true); context.setLineDash([]);
        }
      } else if (references.length) {
        // This is UI-only: the counter retains two independent leg thresholds.
        const targetY = references.reduce(
          (sum, reference) => sum + reference.hip.y - (config.thresholdPercent / 100) * reference.torsoHeight,
          0,
        ) / references.length;
        const guide = stabilizeOverlayLine(guideLinesRef.current.get(slot.participantId), targetY, performance.now());
        guideLinesRef.current.set(slot.participantId, guide);
        const horizontalPoints = [...hips, ...targetKeypoints.map((index) => pose.keypoints[index]).filter(isVisible)];
        if (horizontalPoints.length) {
        const xMin = Math.max(0, Math.min(...horizontalPoints.map((point) => point.x)) - 0.08);
        const xMax = Math.min(1, Math.max(...horizontalPoints.map((point) => point.x)) + 0.08);
        const x1 = toX(xMin);
        const x2 = toX(xMax);
        const y = toY(Math.max(0, Math.min(1, guide.y)));

        context.lineCap = "round";
        context.strokeStyle = "rgba(255, 255, 255, 0.96)";
        context.lineWidth = 10;
        context.beginPath(); context.moveTo(Math.min(x1, x2), y); context.lineTo(Math.max(x1, x2), y); context.stroke();
        context.strokeStyle = "#111111";
        context.lineWidth = 5;
        context.beginPath(); context.moveTo(Math.min(x1, x2), y); context.lineTo(Math.max(x1, x2), y); context.stroke();
        }
      }

      context.strokeStyle = "#FFFFFF";
      context.lineWidth = 3;
      targetKeypoints.forEach((index) => {
        const point = pose.keypoints[index];
        const key = `${slot.participantId}:${index}`;
        const visible = point && point.score >= .25;
        if (!visible) {
          const last = lastPointsRef.current.get(key);
          if (!last || performance.now() - last.seenAt > 180) return;
          context.globalAlpha = .35;
          context.fillStyle = "#6B7280";
          context.beginPath(); context.arc(toX(last.point.x), toY(last.point.y), dotRadius, 0, Math.PI * 2); context.fill(); context.stroke(); context.globalAlpha = 1;
          return;
        }
        lastPointsRef.current.set(key, { point, seenAt: performance.now() });
        context.fillStyle = point.score >= .45 ? "#EF1B23" : "#F59E0B";
        context.beginPath();
        context.arc(toX(point.x), toY(point.y), dotRadius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      });

      if (!bounds) return;
      const headPoints = HEAD_KEYPOINTS
        .map((index) => pose.keypoints[index])
        .filter(isVisible);
      const headBounds = fallbackBounds(headPoints) ?? {
        xMin: bounds.xMin,
        xMax: bounds.xMax,
        yMin: bounds.yMin,
        yMax: Math.min(bounds.yMax, bounds.yMin + Math.max(0.12, (bounds.yMax - bounds.yMin) * 0.24)),
      };
      const averageTorsoHeight = references.length
        ? references.reduce((sum, reference) => sum + reference.torsoHeight, 0) / references.length
        : Math.max(0.08, (bounds.yMax - bounds.yMin) * 0.35);
      // Scale the number from the person's torso, so fullscreen naturally
      // enlarges it with the contained video image instead of using a fixed px cap.
      const fontSize = Math.max(
        48,
        Math.round(Math.min(imageHeight * 0.22, averageTorsoHeight * imageHeight * 0.82)),
      );
      const count = String(slot.leftReps + slot.rightReps);
      const label = countLabelPosition(
        {
          left: Math.min(toX(headBounds.xMin), toX(headBounds.xMax)),
          right: Math.max(toX(headBounds.xMin), toX(headBounds.xMax)),
          top: toY(headBounds.yMin),
          bottom: toY(headBounds.yMax),
        },
        image,
        fontSize,
        count.length,
      );
      const digitColors = ["#FACC15", "#38BDF8", "#4ADE80", "#FB923C", "#E879F9", "#34D399"];
      const digitColor = digitColors[slot.slotIndex % digitColors.length];

      context.font = `900 ${fontSize}px Roboto, system-ui, sans-serif`;
      context.textAlign = label.textAlign;
      context.lineJoin = "round";
      context.miterLimit = 2;
      context.strokeStyle = "#000000";
      context.lineWidth = Math.max(5, Math.round(fontSize * 0.11));
      context.strokeText(count, label.x, label.y);
      context.fillStyle = digitColor;
      context.fillText(count, label.x, label.y);
    });
  }, [config, height, mirrored, size, slots, width]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

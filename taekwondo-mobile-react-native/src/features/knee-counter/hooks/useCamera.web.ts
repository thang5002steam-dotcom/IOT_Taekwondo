import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraFpsOption } from "../types/kneeCounter.types";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>();
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<MediaTrackSettings | null>(null);
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);

  const enumerate = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const all = await navigator.mediaDevices.enumerateDevices();
    const cameras = all.filter((device) => device.kind === "videoinput");
    setDevices(cameras);
    if (!deviceId && cameras[0]) setDeviceId(cameras[0].deviceId);
  }, [deviceId]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
    setSettings(null);
    runningRef.current = false;
  }, []);

  const start = useCallback(async (requestedFps: CameraFpsOption = 30) => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Trình duyệt không hỗ trợ webcam.");
      return false;
    }
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: requestedFps, max: requestedFps }, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) },
      });
      streamRef.current = stream;
      if (!videoRef.current) throw new Error("Không tìm thấy vùng hiển thị camera.");
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      await videoRef.current.play();
      const track = stream.getVideoTracks()[0];
      setSettings(track?.getSettings() ?? null);
      setCapabilities(track?.getCapabilities?.() ?? null);
      await enumerate();
      setRunning(true);
      runningRef.current = true;
      return true;
    } catch (cause) {
      setError(cause instanceof DOMException && cause.name === "NotAllowedError" ? "Bạn cần cấp quyền camera cho trình duyệt." : "Không thể mở webcam. Hãy kiểm tra webcam đang bị ứng dụng khác sử dụng.");
      stop();
      return false;
    }
  }, [deviceId, enumerate, stop]);

  useEffect(() => {
    queueMicrotask(() => { void enumerate(); });
    const onVisibility = () => { if (document.hidden) videoRef.current?.pause(); else if (runningRef.current) void videoRef.current?.play(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { document.removeEventListener("visibilitychange", onVisibility); stop(); };
  }, [enumerate, stop]);

  const selectDeviceId = useCallback((nextDeviceId: string | undefined) => {
    setDeviceId(nextDeviceId);
    setCapabilities(null);
  }, []);

  return { videoRef, devices, deviceId, setDeviceId: selectDeviceId, running, error, settings, capabilities, start, stop };
}

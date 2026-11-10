import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

import { FlipH, Maximize, Minimize } from "reicon-react-native";

import { useToast } from "@/shared/ui/Toast";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { Colors, Spacing, radii } from "@/theme";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";

import { kneeCounterEnabled } from "../config/featureFlags";
import { exportRepEventsCsv } from "../domain/groupEvaluator";
import { useCamera } from "../hooks/useCamera.web";
import { useKneeCounter } from "../hooks/useKneeCounter.web";
import { useSessionClock } from "../hooks/useSessionClock.web";
import { KneeCounterDashboard } from "../components/KneeCounterDashboard.web";
import { KneeCounterDiagnostics } from "../components/KneeCounterDiagnostics.web";
import { PoseOverlay } from "../components/PoseOverlay.web";
import { CameraSessionOverlay } from "../components/CameraSessionOverlay.web";
import { AnalysisSettings } from "../components/AnalysisSettings.web";
import { CameraStatusStrip } from "../components/CameraStatusStrip.web";
import { AnkleReviewQueue } from "../components/AnkleReviewQueue.web";
import { playCountdownCue, playRefereeBuzzer, unlockSessionAudio } from "../utils/buzzerAudio.web";
import { formatSessionDuration } from "../utils/sessionClock.web";
import type { CameraFpsOption } from "../types/kneeCounter.types";

export function KneeCounterScreen() {
  const toast = useToast();
  const {
    videoRef,
    devices: cameraDevices,
    deviceId: cameraDeviceId,
    setDeviceId: setCameraDeviceId,
    running: isCameraRunning,
    error: cameraError,
    settings: cameraSettings,
    capabilities: cameraCapabilities,
    start: startCamera,
    stop: stopCamera,
  } = useCamera();
  const [cameraTargetFps, setCameraTargetFps] = useState<CameraFpsOption>(30);
  const supportedCameraFps = useMemo<CameraFpsOption[]>(() => {
    const range = cameraCapabilities?.frameRate;
    if (!range || typeof range.max !== "number") return [];
    const max = range.max;
    const min = typeof range.min === "number" ? range.min : 0;
    return [15, 30, 45, 60, 90].filter((fps) => fps >= min && fps <= max) as CameraFpsOption[];
  }, [cameraCapabilities]);
  const activeCameraFps = supportedCameraFps.length && !supportedCameraFps.includes(cameraTargetFps)
    ? supportedCameraFps.at(-1)!
    : cameraTargetFps;
  const counter = useKneeCounter(videoRef, {
    requestedCameraFps: activeCameraFps,
    onFallbackToCpu: (message) => {
      toast.show({
        message,
        variant: "warning",
        duration: 5000,
      });
    },
  });
  const { width, height } = useWindowDimensions();
  const compact = width < 1100 || height < 620;
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoHovered, setVideoHovered] = useState(false);
  const resumePendingRef = useRef(false);
  const finalCountdownTickRef = useRef<number | null>(null);
  const sessionClock = useSessionClock({
    status: counter.status,
    targetSeconds: countdownSeconds,
    onCountdownComplete: counter.completeCountdown,
    onTimeUp: () => {
      playRefereeBuzzer(1200);
      counter.finish();
    },
  });

  const frameDimensions = useMemo(() => {
    if (compact || !containerSize.width || !containerSize.height) {
      return null;
    }
    const ar = videoSize.width && videoSize.height ? videoSize.width / videoSize.height : 16 / 9;
    const containerAr = containerSize.width / containerSize.height;
    if (containerAr > ar) {
      const h = Math.floor(containerSize.height);
      const w = Math.floor(h * ar);
      return { width: w, height: h };
    }
    const w = Math.floor(containerSize.width);
    const h = Math.floor(w / ar);
    return { width: w, height: h };
  }, [compact, containerSize.height, containerSize.width, videoSize.height, videoSize.width]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (typeof document === "undefined") return;
      const element = document.getElementById("knee-counter-video-frame");
      if (!document.fullscreenElement) {
        if (element && element.requestFullscreen) {
          await element.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (sessionClock.countdownCue) playCountdownCue(sessionClock.countdownCue);
  }, [sessionClock.countdownCue]);

  useEffect(() => {
    if (counter.status !== "running" || sessionClock.remainingSeconds > 10 || sessionClock.remainingSeconds < 1) {
      finalCountdownTickRef.current = null;
      return;
    }
    if (finalCountdownTickRef.current === sessionClock.remainingSeconds) return;
    finalCountdownTickRef.current = sessionClock.remainingSeconds;
    playCountdownCue("1");
  }, [counter.status, sessionClock.remainingSeconds]);

  const progressPercent = countdownSeconds > 0
    ? Math.min(100, Math.max(0, ((countdownSeconds - sessionClock.remainingSeconds) / countdownSeconds) * 100))
    : 0;
  const isTimeUp = counter.status === "finished";
  const isUrgent = sessionClock.remainingSeconds <= 5 && sessionClock.remainingSeconds > 0 && counter.status === "running";
  const showVideoTimer = isCameraRunning;

  const exportCsv = () => {
    const csv = exportRepEventsCsv(counter.events);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `knee-counter-${new Date().toISOString().replaceAll(":", "-")}.csv`; anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!kneeCounterEnabled) {
    return <StackScreenLayout title="AI Knee Counter"><View style={styles.center}><ThemedText type="heading" style={styles.title}>Tính năng chưa được bật</ThemedText><ThemedText type="body" style={styles.secondary}>Quản trị viên cần bật EXPO_PUBLIC_KNEE_COUNTER_ENABLED cho môi trường Web.</ThemedText></View></StackScreenLayout>;
  }
  const start = async () => {
    if (await startCamera(activeCameraFps)) {
      await counter.start();
      sessionClock.startNewSession(countdownSeconds);
    }
  };
  const stop = async () => {
    sessionClock.cancel();
    await counter.stop();
    stopCamera();
    resumePendingRef.current = false;
  };
  const handleBeginCounting = () => {
    if (countdownSeconds < 1) return;
    unlockSessionAudio();
    if (!resumePendingRef.current) sessionClock.startNewSession(countdownSeconds);
    resumePendingRef.current = false;
    counter.beginCounting();
  };
  const handleResume = () => {
    resumePendingRef.current = true;
    counter.resume();
  };
  const handleRestart = () => {
    if (countdownSeconds < 1) return;
    unlockSessionAudio();
    sessionClock.startNewSession(countdownSeconds);
    counter.restart();
  };
  const handleReset = () => {
    counter.reset();
    sessionClock.startNewSession(countdownSeconds);
  };
  const cameraLabels = cameraDevices.map((device, index) => device.label || `Camera ${index + 1}`);
  const selectedCameraLabel = cameraDevices.find((device) => device.deviceId === cameraDeviceId)?.label;

  const workspace = <View style={[styles.workspace, compact && styles.workspaceCompact]}>
    <View style={[styles.leftColumn, compact && styles.leftColumnCompact]}>
      <View style={styles.intro}><ThemedText type="heading" style={styles.title}>Đếm rút gối realtime</ThemedText><ThemedText type="bodySmall" style={styles.secondary}>Xử lý trực tiếp trên trình duyệt · Chrome/Edge Windows</ThemedText></View>
      <View style={[styles.cameraCard, compact && styles.cameraCardCompact]}>
        <View
          style={[styles.videoContainer, compact && styles.videoContainerCompact]}
          onLayout={(event) => {
            const { width: w, height: h } = event.nativeEvent.layout;
            if (w > 0 && h > 0) {
              setContainerSize((prev) => {
                if (Math.abs(prev.width - w) < 1 && Math.abs(prev.height - h) < 1) return prev;
                return { width: w, height: h };
              });
            }
          }}
        >
          <div onMouseEnter={() => setVideoHovered(true)} onMouseLeave={() => setVideoHovered(false)} style={{ display: "contents" }}>
          <View
            nativeID="knee-counter-video-frame"
            {...({ id: "knee-counter-video-frame" } as Record<string, unknown>)}
            style={[
              styles.videoFrame,
              isFullscreen
                ? styles.videoFrameFullscreen
                : compact
                  ? styles.videoFrameCompact
                  : frameDimensions
                    ? { width: frameDimensions.width, height: frameDimensions.height, aspectRatio: undefined }
                    : styles.videoFrameFallback,
            ]}
          >
            <video
              ref={videoRef}
              onLoadedMetadata={(event) => setVideoSize({ width: event.currentTarget.videoWidth || 1280, height: event.currentTarget.videoHeight || 720 })}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#10141A",
                transform: counter.config.flipHorizontal ? "scaleX(-1)" : "none",
              }}
              playsInline
              muted
            />
            <PoseOverlay
              slots={counter.slots}
              width={videoSize.width}
              height={videoSize.height}
              config={counter.config}
              mirrored={counter.config.flipHorizontal}
            />
            <CameraSessionOverlay
              countdownCue={sessionClock.countdownCue}
              finished={counter.status === "finished"}
            />
            <View style={styles.videoMeta}>
              <View style={styles.liveDot} />
              <ThemedText type="caption" style={styles.videoMetaText}>LIVE</ThemedText>
            </View>
            {showVideoTimer ? (
              <View
                accessibilityRole="timer"
                accessibilityLabel={`Thời gian còn lại ${formatSessionDuration(sessionClock.remainingSeconds)}`}
                style={[
                  styles.sessionTimer,
                  isFullscreen && styles.sessionTimerFullscreen,
                  isUrgent && styles.sessionTimerUrgent,
                  isTimeUp && styles.sessionTimerTimeUp,
                ]}
              >
                <ThemedText
                  type="title"
                  style={[
                    styles.sessionTimerText,
                    isFullscreen && styles.sessionTimerTextFullscreen,
                    isUrgent && styles.sessionTimerUrgentText,
                    isTimeUp && styles.sessionTimerTimeUpText,
                  ]}
                >
                  {formatSessionDuration(sessionClock.remainingSeconds)}
                </ThemedText>
              </View>
            ) : null}
            {isCameraRunning && counter.status === "aligning" ? (
              <View pointerEvents="box-none" style={styles.startCountingOverlay}>
                <ThemedText type="bodySmall" style={styles.startCountingHint}>Sẵn sàng khi khung hình đã ổn định</ThemedText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Bắt đầu đếm"
                  accessibilityState={{ disabled: countdownSeconds < 1 }}
                  disabled={countdownSeconds < 1}
                  onPress={handleBeginCounting}
                  style={({ pressed }) => [
                    styles.startCountingButton,
                    countdownSeconds < 1 && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText type="action" style={styles.startCountingButtonText}>Bắt đầu đếm</ThemedText>
                </Pressable>
              </View>
            ) : null}
            <View style={[styles.videoControls, videoHovered && styles.videoControlsVisible]} pointerEvents={videoHovered ? "auto" : "none"}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isFullscreen ? "Thu nhỏ camera" : "Toàn màn hình"}
                onPress={() => void toggleFullscreen()}
                style={({ pressed }) => [
                  styles.videoIconButton,
                  isFullscreen && styles.videoIconButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  icon={isFullscreen ? <Minimize /> : <Maximize />}
                  size={19}
                  color={isFullscreen ? Colors.light.primary : Colors.light.surface}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lật ngang camera"
                accessibilityState={{ selected: counter.config.flipHorizontal }}
                onPress={() => counter.updateConfig({ flipHorizontal: !counter.config.flipHorizontal })}
                style={({ pressed }) => [
                  styles.videoIconButton,
                  counter.config.flipHorizontal && styles.videoIconButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  icon={<FlipH />}
                  size={19}
                  color={counter.config.flipHorizontal ? Colors.light.primary : Colors.light.surface}
                />
              </Pressable>
            </View>
            {/* Bottom Countdown Processing Bar */}
            <View style={styles.bottomProgressBarContainer}>
              <View
                style={[
                  styles.bottomProgressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: isTimeUp ? "#EF4444" : isUrgent ? "#F59E0B" : "#10B981",
                  },
                ]}
              />
            </View>
            {!isCameraRunning ? <View style={styles.videoHint}><ThemedText type="body" style={styles.videoHintText}>Bật camera để bắt đầu</ThemedText></View> : null}
          </View>
          </div>
        </View>
        {cameraError ? <ThemedText accessibilityRole="alert" type="bodySmall" style={styles.error}>{cameraError}</ThemedText> : null}
        {counter.error ? <ThemedText accessibilityRole="alert" type="bodySmall" style={styles.error}>{counter.error}</ThemedText> : null}
        <CameraStatusStrip
          detectedCount={counter.detectedCount}
          status={counter.status}
          targetSeconds={countdownSeconds}
          onChangeTargetSeconds={(sec) => {
            setCountdownSeconds(sec);
            if (counter.status !== "finished") sessionClock.startNewSession(sec);
          }}
          running={isCameraRunning}
          inferenceFps={counter.metrics.inferenceFps}
          busy={counter.status === "loading-model" || counter.status === "benchmarking"}
          onPrimaryAction={isCameraRunning && counter.status === "paused" ? handleResume : isCameraRunning ? stop : start}
        />
        <View style={styles.actionRow}>
          {isCameraRunning && counter.status !== "paused" ? <Action label="Tạm dừng" onPress={counter.pause} disabled={counter.status !== "running"} /> : null}
          {isCameraRunning && (counter.status === "paused" || counter.status === "finished") ? <Action label="Bắt đầu lại" onPress={handleRestart} disabled={countdownSeconds < 1} /> : null}
          {isCameraRunning ? <Action label="Dừng" onPress={() => void stop()} /> : null}
        </View>
      </View>
    </View>
    <ScrollView style={[styles.sidebarScroll, compact && styles.sidebarScrollCompact]} contentContainerStyle={styles.sidebarContent} showsVerticalScrollIndicator={false}>
      <AnalysisSettings config={counter.config} backendOptions={[]} cameraLabels={cameraLabels} selectedCameraId={selectedCameraLabel} expanded={settingsExpanded} onToggle={() => setSettingsExpanded((value) => !value)} onConfigChange={(patch) => {
        const landmarkChanged = patch.measurementLandmark !== undefined && patch.measurementLandmark !== counter.config.measurementLandmark;
        counter.updateConfig(patch);
        if (landmarkChanged) {
          counter.resetForLandmarkChange();
          sessionClock.startNewSession(countdownSeconds);
          resumePendingRef.current = false;
        }
      }} cameraFps={activeCameraFps} cameraFpsOptions={supportedCameraFps} onCameraFpsChange={setCameraTargetFps} onCameraChange={(label) => { const device = cameraDevices.find((candidate, index) => (candidate.label || `Camera ${index + 1}`) === label); if (device) { setCameraDeviceId(device.deviceId); void stop(); } }} />
      <AnkleReviewQueue candidates={counter.reviewCandidates} onResolve={counter.resolveAnkleReview} />
      <KneeCounterDashboard slots={counter.slots} detectedCount={counter.detectedCount} totalReps={counter.totalReps} passCount={counter.passCount} groupPassCount={counter.groupPassCount} synchronizedGroupPass={counter.synchronizedGroupPass} mode={counter.config.mode} status={counter.status} onReset={handleReset} onExport={exportCsv} />
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showDiagnostics }} onPress={() => setShowDiagnostics((value) => !value)} style={styles.diagnosticsToggle}><ThemedText type="bodySmall" style={styles.secondary}>{showDiagnostics ? "Ẩn chẩn đoán" : "Hiện chẩn đoán"}</ThemedText></Pressable>
      {showDiagnostics ? <KneeCounterDiagnostics capabilities={counter.capabilities} trace={counter.trace} /> : null}
    </ScrollView>
  </View>;
  return <StackScreenLayout title="AI Knee Counter" scrollEnabled={compact} refreshEnabled={false} contentContainerStyle={[styles.content, compact && styles.contentCompact]}>{workspace}</StackScreenLayout>;
}

function Action({ label, disabled = false, onPress }: { label: string; disabled?: boolean; onPress: () => void | Promise<void> }) { return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={() => void onPress()} style={({ pressed }) => [styles.action, disabled && styles.disabled, pressed && styles.pressed]}><ThemedText type="action" style={styles.title}>{label}</ThemedText></Pressable>; }

const styles = StyleSheet.create({
  content: { flex: 1, minHeight: 0, paddingBottom: 16 },
  contentCompact: { flex: undefined, flexGrow: 1 },
  workspace: { flex: 1, minHeight: 0, flexDirection: "row", gap: Spacing.three },
  workspaceCompact: { flexDirection: "column", flex: undefined },
  leftColumn: { flex: 1, minWidth: 0, minHeight: 0, gap: Spacing.two },
  leftColumnCompact: { flex: undefined },
  sidebarScroll: { width: 410, minWidth: 360, flexGrow: 0, flexShrink: 0 },
  sidebarScrollCompact: { width: "100%", minWidth: 0 },
  sidebarContent: { gap: Spacing.three, paddingBottom: Spacing.four },
  intro: { gap: 4 },
  title: { color: Colors.light.text },
  secondary: { color: Colors.light.textSecondary },
  center: { flex: 1, minHeight: 420, justifyContent: "center", alignItems: "center", gap: Spacing.two, padding: Spacing.four },
  cameraCard: { flex: 1, minHeight: 0, gap: Spacing.two, padding: Spacing.three, borderRadius: radii.lg, backgroundColor: Colors.light.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider },
  cameraCardCompact: { flex: undefined },
  videoContainer: { flex: 1, minHeight: 0, width: "100%", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  videoContainerCompact: { flex: undefined, width: "100%" },
  videoFrame: { position: "relative", overflow: "hidden", borderRadius: radii.md, backgroundColor: "#10141A" },
  videoFrameCompact: { width: "100%", aspectRatio: 16 / 9 },
  videoFrameFullscreen: { width: "100%", height: "100%", borderRadius: 0 },
  videoFrameFallback: { width: "100%", height: "100%", maxHeight: "100%", maxWidth: "100%", aspectRatio: 16 / 9 },
  bottomProgressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 25,
    overflow: "hidden",
  },
  bottomProgressBarFill: {
    height: "100%",
  },
  videoMeta: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, borderRadius: radii.pill, backgroundColor: "rgba(0,0,0,0.68)" },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#31D158" },
  videoMetaText: { color: Colors.light.surface, fontWeight: "800", letterSpacing: 0.7 },
  sessionTimer: { position: "absolute", zIndex: 11, top: 12, right: 12, width: 104, height: 104, alignItems: "center", justifyContent: "center", borderRadius: radii.lg, backgroundColor: "rgba(0,0,0,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  sessionTimerFullscreen: { top: 20, right: 20, width: 168, height: 168, borderRadius: radii.xl },
  sessionTimerUrgent: { borderColor: "#F59E0B" },
  sessionTimerTimeUp: { borderColor: Colors.light.error },
  sessionTimerText: { color: Colors.light.surface, fontVariant: ["tabular-nums"], fontSize: 35, lineHeight: 42, fontWeight: "900", letterSpacing: 0.5 },
  sessionTimerTextFullscreen: { fontSize: 58, lineHeight: 68, letterSpacing: 0.8 },
  sessionTimerUrgentText: { color: "#FBBF24" },
  sessionTimerTimeUpText: { color: "#F87171" },
  startCountingOverlay: { position: "absolute", zIndex: 14, bottom: 28, left: 16, right: 16, alignItems: "center", gap: Spacing.one },
  startCountingHint: { color: "rgba(255,255,255,0.9)", fontWeight: "700", textAlign: "center", textShadowColor: "rgba(0,0,0,0.72)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  startCountingButton: { minHeight: 48, minWidth: 172, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, paddingHorizontal: Spacing.three, backgroundColor: Colors.light.primary, borderWidth: 1, borderColor: "rgba(255,255,255,0.42)" },
  startCountingButtonText: { color: Colors.light.surface, fontWeight: "800" },
  videoControls: { position: "absolute", zIndex: 16, right: 12, bottom: 20, flexDirection: "row", gap: Spacing.one, opacity: 0 },
  videoControlsVisible: { opacity: 1 },
  videoIconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: "rgba(0,0,0,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  videoIconButtonActive: { backgroundColor: Colors.light.surface, borderColor: Colors.light.primary },
  videoHint: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  videoHintText: { color: Colors.light.surface },
  error: { color: Colors.light.error },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  action: { minHeight: 48, flex: 1, minWidth: 120, alignItems: "center", justifyContent: "center", borderRadius: radii.md, borderWidth: 1, borderColor: Colors.light.divider, paddingHorizontal: Spacing.three },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.78 },
  diagnosticsToggle: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
});

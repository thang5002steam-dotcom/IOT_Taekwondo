import { useEffect, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { HelpCircle, LogOut } from 'lucide-react-native';

import { ThemedText } from '@/shared/ui/ThemedText';
import { usePracticeRoom } from '../hooks/usePracticeRoom';
import type { PracticeSide } from '../domain/practice.types';

type ScorePoint = 1 | 2 | 3;

function ScoreButton({ side, point, compact = false, enabled, onScore }: {
  side: PracticeSide;
  point: ScorePoint;
  compact?: boolean;
  enabled: boolean;
  onScore: (side: PracticeSide, point: ScorePoint) => void;
}) {
  const isRed = side === 'red';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isRed ? 'Đỏ' : 'Xanh'} cộng ${point} điểm`}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={() => onScore(side, point)}
      style={({ pressed }) => [
        compact ? styles.topScoreButton : styles.judgeCard,
        isRed ? styles.redScoreButton : styles.blueScoreButton,
        !enabled && styles.scoreButtonDisabled,
        pressed && (compact ? styles.topScoreButtonPressed : styles.judgeCardPressed),
      ]}
    >
      <ThemedText style={compact ? styles.topScoreText : styles.judgeCardText}>+{point}</ThemedText>
    </Pressable>
  );
}

export function PracticeRoomScreen() {
  const router = useRouter();
  const { roomCode: raw } = useLocalSearchParams<{ roomCode: string }>();
  const roomCode = Array.isArray(raw) ? raw[0] : raw ?? '';
  const { snapshot, error, connecting, send } = usePracticeRoom(roomCode);
  const player = useVideoPlayer(snapshot.videoUrl ?? null, (videoPlayer) => { videoPlayer.loop = false; });
  const enabled = snapshot.status === 'RUNNING';
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => { void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); };
  }, []);

  useEffect(() => {
    if (snapshot.status === 'RUNNING') {
      // expo-video's player is an imperative native controller.
      // eslint-disable-next-line react-hooks/immutability
      player.currentTime = snapshot.mediaOffsetMs / 1000;
      player.play();
      return;
    }
    player.pause();
    if (snapshot.status === 'PAUSED' || snapshot.status === 'WAITING') {
      player.currentTime = snapshot.mediaOffsetMs / 1000;
    }
  }, [player, snapshot.mediaOffsetMs, snapshot.status]);

  const score = (side: PracticeSide, point: ScorePoint) => {
    if (!enabled) return;
    void Haptics.impactAsync(point === 1 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
    send({ type: 'judgeScore', side, points: point });
  };

  const toggleReady = () => {
    if (!snapshot.videoUploaded) return;
    const nextReady = !isReady;
    setIsReady(nextReady);
    send({ type: nextReady ? 'ready' : 'notReady' });
  };

  const statusLabel = connecting ? 'ĐANG KẾT NỐI' : snapshot.status === 'COUNTDOWN' ? '3 · 2 · 1' : snapshot.status === 'PAUSED' ? 'TẠM DỪNG' : snapshot.status === 'WAITING' ? 'CHỜ SẴN SÀNG' : 'ĐANG CHẤM ĐIỂM';

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {snapshot.videoUrl ? <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls={false} contentFit="contain" /> : <View style={styles.emptyVideo}><ThemedText style={styles.emptyVideoText}>Đang chờ video từ web…</ThemedText></View>}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Rời phòng tập" onPress={() => router.back()} style={({ pressed }) => [styles.topIconButton, pressed && styles.iconPressed]}><LogOut size={22} color="#FFFFFF" /></Pressable>
        <View style={styles.codeBadge}><ThemedText style={styles.codeText}>{roomCode}</ThemedText></View>
        <View style={styles.statusBadge}><ThemedText style={styles.statusText}>{statusLabel}</ThemedText><HelpCircle size={18} color="#FFFFFF" /></View>
      </View>

      <View style={styles.scoreStage} pointerEvents="box-none">
        <View style={styles.topScoreRow}>
          <ScoreButton side="red" point={1} compact enabled={enabled} onScore={score} />
          <ScoreButton side="blue" point={1} compact enabled={enabled} onScore={score} />
        </View>
        <View style={styles.cardsRow}>
          <ScoreButton side="red" point={2} enabled={enabled} onScore={score} />
          <ScoreButton side="red" point={3} enabled={enabled} onScore={score} />
          <ScoreButton side="blue" point={3} enabled={enabled} onScore={score} />
          <ScoreButton side="blue" point={2} enabled={enabled} onScore={score} />
        </View>
        {!enabled ? <View style={styles.waitingOverlay} pointerEvents="box-none">
          <ThemedText style={styles.waitingText}>{snapshot.status === 'PAUSED' ? 'Đã tạm dừng — chờ đủ trọng tài sẵn sàng' : 'Tải video xong rồi nhấn Sẵn sàng'}</ThemedText>
          <Pressable accessibilityRole="button" accessibilityLabel={isReady ? 'Hủy sẵn sàng' : 'Sẵn sàng'} accessibilityState={{ disabled: !snapshot.videoUploaded, selected: isReady }} disabled={!snapshot.videoUploaded} onPress={toggleReady} style={({ pressed }) => [styles.readyButton, isReady && styles.readyButtonActive, !snapshot.videoUploaded && styles.readyButtonDisabled, pressed && snapshot.videoUploaded && styles.topScoreButtonPressed]}><ThemedText style={styles.readyButtonText}>{isReady ? 'ĐÃ SẴN SÀNG — NHẤN ĐỂ HỦY' : 'SẴN SÀNG'}</ThemedText></Pressable>
        </View> : null}
      </View>

      <View style={styles.footer} pointerEvents="none"><ThemedText style={styles.footerScore}>ĐỎ {snapshot.redScore} — {snapshot.blueScore} XANH</ThemedText>{error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  emptyVideo: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  emptyVideoText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  topBar: { height: 44, backgroundColor: '#1C1C1E', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topIconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  iconPressed: { opacity: 0.6 },
  codeBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 2, borderRadius: 6, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  codeText: { fontSize: 22, fontWeight: '900', color: '#1C1C1E', fontVariant: ['tabular-nums'], letterSpacing: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scoreStage: { flex: 1, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 8, gap: 8 },
  topScoreRow: { height: 48, flexDirection: 'row', gap: 8 },
  cardsRow: { flex: 1, flexDirection: 'row', gap: 8 },
  topScoreButton: { flex: 1, borderRadius: 8, borderCurve: 'continuous', justifyContent: 'center', alignItems: 'center' },
  topScoreButtonPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  redScoreButton: { backgroundColor: 'rgba(239, 55, 53, 0.52)' },
  blueScoreButton: { backgroundColor: 'rgba(39, 104, 255, 0.52)' },
  topScoreText: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', lineHeight: 36 },
  judgeCard: { flex: 1, minHeight: 74, borderRadius: 10, borderCurve: 'continuous', justifyContent: 'center', alignItems: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 4 },
  judgeCardPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  judgeCardText: { fontSize: 64, fontWeight: '900', color: '#FFFFFF', lineHeight: 72 },
  scoreButtonDisabled: { opacity: 0.55 },
  waitingOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: '28%', backgroundColor: 'rgba(0, 0, 0, 0.38)' },
  waitingText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowRadius: 6 },
  readyButton: { backgroundColor: '#16A34A', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 10 },
  readyButtonActive: { backgroundColor: '#0F766E', borderWidth: 2, borderColor: '#A7F3D0' },
  readyButtonDisabled: { opacity: 0.4 },
  readyButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  footer: { minHeight: 38, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 4 },
  footerScore: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  errorText: { color: '#FFFFFF', backgroundColor: '#B00020', paddingHorizontal: 6, fontSize: 12, fontWeight: '700' },
});

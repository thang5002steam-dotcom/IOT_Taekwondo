import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, radii } from '@/theme';
import type { FaceQualityReason, ScannerState, ScanState } from '../types/faceScanner.types';

type CheckInViewfinderProps = {
  scanState: ScannerState | ScanState;
  scanAreaHeight: number;
  feedbackMessage?: string;
  qualityReason?: FaceQualityReason;
};

export function CheckInViewfinder({
  scanState,
  scanAreaHeight,
  feedbackMessage,
}: CheckInViewfinderProps) {
  const { width } = useWindowDimensions();
  const usableHeight = Math.max(scanAreaHeight - 56, 240);
  const frameWidth = Math.max(
    180,
    Math.min(width * 0.72, 280, usableHeight / 1.35),
  );
  const frameHeight = frameWidth * 1.35;
  const frameRadius = frameWidth / 2;
  const laserTranslateY = useSharedValue(0);

  useEffect(() => {
    laserTranslateY.set(0);
    laserTranslateY.set(
      withRepeat(
        withTiming(frameHeight - 20, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, [frameHeight, laserTranslateY]);

  const laserAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserTranslateY.get() }],
  }));

  const isSuccess = scanState === 'SUCCESS' || scanState === 'result';
  const isAnalyzing =
    scanState === 'ANALYZING' ||
    scanState === 'face-ready' ||
    scanState === 'capturing' ||
    scanState === 'submitting';
  const isError = scanState === 'ERROR' || scanState === 'error';

  const defaultStatusText = isSuccess
    ? 'Đã nhận diện thành công!'
    : isAnalyzing
      ? 'Đang phân tích khuôn mặt...'
      : isError
        ? 'Chưa nhận diện được'
        : 'Đang nhận diện...';

  const statusText = feedbackMessage || defaultStatusText;

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.ovalFrame,
          {
            width: frameWidth,
            height: frameHeight,
            borderRadius: frameRadius,
          },
          isSuccess
            ? styles.ovalSuccess
            : isAnalyzing
              ? styles.ovalAnalyzing
              : isError
                ? styles.ovalError
                : null,
        ]}
      >
        <Animated.View style={[styles.laserBarContainer, laserAnimatedStyle]}>
          <View style={styles.laserLine} />
          <View style={styles.laserGlow} />
        </Animated.View>
      </View>

      <View style={styles.statusBadge}>
        <View
          style={[
            styles.statusDot,
            isSuccess
              ? styles.dotSuccess
              : isAnalyzing
                ? styles.dotAnalyzing
                : isError
                  ? styles.dotError
                  : null,
          ]}
        />
        <ThemedText type="caption" style={styles.statusText}>
          {statusText}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalFrame: {
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  ovalSuccess: {
    borderColor: Colors.light.success,
    shadowColor: Colors.light.success,
  },
  ovalAnalyzing: {
    borderColor: '#4EFFF3',
    shadowColor: '#4EFFF3',
  },
  ovalError: {
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  laserBarContainer: {
    width: '100%',
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  laserLine: {
    width: '90%',
    height: 2.5,
    backgroundColor: '#4EFFF3',
    borderRadius: radii.pill,
    shadowColor: '#4EFFF3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  laserGlow: {
    position: 'absolute',
    width: '95%',
    height: 12,
    backgroundColor: 'rgba(78, 255, 243, 0.25)',
    borderRadius: radii.pill,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    marginTop: 24,
    gap: 8,
    maxWidth: '85%',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: '#10B981',
  },
  dotSuccess: {
    backgroundColor: '#10B981',
  },
  dotAnalyzing: {
    backgroundColor: '#4EFFF3',
  },
  dotError: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    color: Colors.light.surface,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
});

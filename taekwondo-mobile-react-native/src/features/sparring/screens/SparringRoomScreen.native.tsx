import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  PanResponder,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LogOut, HelpCircle } from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
  Text as SvgText,
  Circle,
} from 'react-native-svg';

import { ThemedText } from '@/shared/ui/ThemedText';
import { isSparringRoomCode, judgeScoreForGesture } from '../domain/sparringRoom';
import { useSparringRoom } from '../hooks/useSparringRoom';
import type { SparringSide } from '../domain/sparring.types';

let NavigationBar: typeof import('expo-navigation-bar') | null = null;
let ScreenOrientation: typeof import('expo-screen-orientation') | null = null;
try {
  NavigationBar = require('expo-navigation-bar');
} catch {
  // Expo Go may not include this native module.
}
try {
  ScreenOrientation = require('expo-screen-orientation');
} catch {
  // Expo Go may not include this native module.
}

// Ngưỡng phát hiện vuốt kéo lên theo trục Y (âm là kéo lên phía trên).
// Đặt -15px để phản hồi cực kỳ nhạy và dứt khoát trên màn hình cảm ứng
const SWIPE_UP_DISTANCE = -15;

class JudgeGestureTracker {
  private startY = 0;
  private triggered = false;

  start(pageY: number) {
    this.startY = pageY;
    this.triggered = false;
  }

  displacement(gestureDy: number, pageY: number) {
    return gestureDy !== 0 ? gestureDy : pageY - this.startY;
  }

  triggerOnce() {
    if (this.triggered) return false;
    this.triggered = true;
    return true;
  }

  wasTriggered() {
    return this.triggered;
  }
}

interface JudgeCardProps {
  side: SparringSide;
  basePoints: 2 | 3;
  onScore: (side: SparringSide, points: 1 | 2 | 3 | 4 | 5) => void;
}

export function JudgeCard({ side, basePoints, onScore }: JudgeCardProps) {
  const isRed = side === 'red';
  const swipePoints = judgeScoreForGesture(basePoints, true);

  const [isPressed, setIsPressed] = useState(false);

  const triggerScore = useCallback(
    (pts: 1 | 2 | 3 | 4 | 5) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onScore(side, pts);
    },
    [side, onScore]
  );

  // PanResponder native 100% đáng tin cậy trên React Native Mobile
  const panResponder = useMemo(
    () => {
      const gesture = new JudgeGestureTracker();
      return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: (evt) => {
        gesture.start(evt.nativeEvent.pageY);
        setIsPressed(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const dy = gesture.displacement(gestureState.dy, evt.nativeEvent.pageY);
        if (dy <= SWIPE_UP_DISTANCE && gesture.triggerOnce()) {
          triggerScore(swipePoints);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsPressed(false);
        const dy = gesture.displacement(gestureState.dy, evt.nativeEvent.pageY);
        if (!gesture.wasTriggered()) {
          if (dy <= SWIPE_UP_DISTANCE) {
            gesture.triggerOnce();
            triggerScore(swipePoints);
          } else {
            triggerScore(basePoints);
          }
        }
      },
      onPanResponderTerminate: () => {
        setIsPressed(false);
      },
      });
    },
    [basePoints, swipePoints, triggerScore]
  );

  const dotsColor = 'rgba(255, 255, 255, 0.45)';

  return (
    <View style={styles.cardWrapper}>
      {/* Mũi tên dạng hạt chấm hướng lên báo hiệu kéo lên */}
      <View style={styles.arrowIndicatorContainer} pointerEvents="none">
        <Svg width={44} height={36} viewBox="0 0 44 36">
          <Circle cx="22" cy="4" r="2.2" fill={dotsColor} />
          <Circle cx="17" cy="11" r="2.2" fill={dotsColor} />
          <Circle cx="22" cy="11" r="2.2" fill={dotsColor} />
          <Circle cx="27" cy="11" r="2.2" fill={dotsColor} />
          <Circle cx="12" cy="18" r="2.2" fill={dotsColor} />
          <Circle cx="17" cy="18" r="2.2" fill={dotsColor} />
          <Circle cx="22" cy="18" r="2.2" fill={dotsColor} />
          <Circle cx="27" cy="18" r="2.2" fill={dotsColor} />
          <Circle cx="32" cy="18" r="2.2" fill={dotsColor} />
          <Circle cx="19" cy="25" r="2.2" fill={dotsColor} />
          <Circle cx="25" cy="25" r="2.2" fill={dotsColor} />
          <Circle cx="19" cy="32" r="2.2" fill={dotsColor} />
          <Circle cx="25" cy="32" r="2.2" fill={dotsColor} />
        </Svg>
      </View>

      {/* Ô chấm điểm cố định 100% vị trí, không bị kéo chạy theo, chỉ đổi style hover/press */}
      <View
        {...panResponder.panHandlers}
        accessibilityLabel={`${side === 'red' ? 'Đỏ' : 'Xanh'} cộng ${basePoints} điểm`}
        accessibilityRole="button"
        style={[
          styles.judgeCard,
          isRed ? styles.redCard : styles.blueCard,
          isPressed && styles.judgeCardPressed,
        ]}>
        <ThemedText style={styles.judgeCardText}>{basePoints}</ThemedText>
      </View>
    </View>
  );
}

export function SparringRoomScreen() {
  const router = useRouter();
  const { roomCode: raw } = useLocalSearchParams<{ roomCode: string }>();
  const roomCode = Array.isArray(raw) ? raw[0] : raw;
  const { send } = useSparringRoom(roomCode ?? '');

  useEffect(() => {
    if (ScreenOrientation) {
      void ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }
    if (NavigationBar) void NavigationBar.setVisibilityAsync('hidden');
    return () => {
      if (ScreenOrientation) {
        void ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      }
      if (NavigationBar) void NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  const handleScore = useCallback(
    (side: SparringSide, points: 1 | 2 | 3 | 4 | 5) => {
      send({ type: 'judgeScore', side, points });
    },
    [send]
  );

  if (!isSparringRoomCode(roomCode ?? '')) return null;

  const handleScore1 = (side: SparringSide) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    send({ type: 'judgeScore', side, points: 1 });
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* TOP BAR: [Icon Logout] [RoomCode Box] [Help Icon] */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rời sàn đấu"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.topIconButton,
            pressed && styles.iconPressed,
          ]}>
          <LogOut size={22} color="#FFFFFF" />
        </Pressable>

        <View style={styles.codeBadge}>
          <ThemedText style={styles.codeText}>{roomCode}</ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trợ giúp"
          style={({ pressed }) => [
            styles.topIconButton,
            pressed && styles.iconPressed,
          ]}>
          <HelpCircle size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* TOP SCORE 1 BUTTONS ROW */}
      <View style={styles.topScoreRow}>
        {/* Nút Đỏ 1 điểm */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đỏ cộng 1 điểm"
          onPress={() => handleScore1('red')}
          style={({ pressed }) => [
            styles.topScoreButton,
            styles.redTopScore,
            pressed && styles.topScoreButtonPressed,
          ]}>
          <ThemedText style={styles.topScoreText}>1</ThemedText>
        </Pressable>

        {/* Nút Xanh 1 điểm */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xanh cộng 1 điểm"
          onPress={() => handleScore1('blue')}
          style={({ pressed }) => [
            styles.topScoreButton,
            styles.blueTopScore,
            pressed && styles.topScoreButtonPressed,
          ]}>
          <ThemedText style={styles.topScoreText}>1</ThemedText>
        </Pressable>
      </View>

      {/* DẢI BANNER TRUNG TÂM VỚI GRADIENT & HOẠ TIẾT MỜ "+2" */}
      <View style={styles.bannerContainer}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgLinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#A21517" stopOpacity="0.85" />
              <Stop offset="25%" stopColor="#4A184D" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#2E2B5A" stopOpacity="0.8" />
              <Stop offset="75%" stopColor="#1E3875" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#154CA2" stopOpacity="0.85" />
            </SvgLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />

          {/* Dòng chữ +2 mờ chạy dọc dải */}
          <SvgText x="15" y="16" fill="rgba(255,255,255,0.22)" fontSize="13" fontWeight="900">+2</SvgText>
          <SvgText x="50" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="100" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>
          <SvgText x="160" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="200" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>
          <SvgText x="260" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="300" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>
          <SvgText x="365" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="410" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>
          <SvgText x="470" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="515" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>
          <SvgText x="575" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="625" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>
          <SvgText x="680" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="730" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>
          <SvgText x="785" y="18" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">+2</SvgText>
          <SvgText x="835" y="24" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="900">+2</SvgText>

          <SvgText x="20" y="44" fill="rgba(255,255,255,0.22)" fontSize="16" fontWeight="800">+2</SvgText>
          <SvgText x="70" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
          <SvgText x="130" y="46" fill="rgba(255,255,255,0.25)" fontSize="18" fontWeight="800">+2</SvgText>
          <SvgText x="180" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
          <SvgText x="235" y="46" fill="rgba(255,255,255,0.25)" fontSize="18" fontWeight="800">+2</SvgText>
          <SvgText x="285" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
          <SvgText x="345" y="46" fill="rgba(255,255,255,0.25)" fontSize="18" fontWeight="800">+2</SvgText>
          <SvgText x="395" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
          <SvgText x="450" y="46" fill="rgba(255,255,255,0.25)" fontSize="18" fontWeight="800">+2</SvgText>
          <SvgText x="500" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
          <SvgText x="555" y="46" fill="rgba(255,255,255,0.25)" fontSize="18" fontWeight="800">+2</SvgText>
          <SvgText x="605" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
          <SvgText x="660" y="46" fill="rgba(255,255,255,0.25)" fontSize="18" fontWeight="800">+2</SvgText>
          <SvgText x="710" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
          <SvgText x="765" y="46" fill="rgba(255,255,255,0.25)" fontSize="18" fontWeight="800">+2</SvgText>
          <SvgText x="815" y="40" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">+2</SvgText>
        </Svg>
      </View>

      {/* 4 NÚT CHẤM ĐIỂM CHÍNH: ĐỎ 2 | ĐỎ 3 | XANH 3 | XANH 2 */}
      <View style={styles.cardsRow}>
        <JudgeCard side="red" basePoints={2} onScore={handleScore} />
        <JudgeCard side="red" basePoints={3} onScore={handleScore} />
        <JudgeCard side="blue" basePoints={3} onScore={handleScore} />
        <JudgeCard side="blue" basePoints={2} onScore={handleScore} />
      </View>

      {/* FOOTER: totalTKD+ BRANDING */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerBrand}>
          total<ThemedText style={styles.footerBrandAccent}>TKD</ThemedText>
          <ThemedText style={styles.footerBrandPlus}>+</ThemedText>
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C5CCD1',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topBar: {
    height: 44,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topIconButton: {
    padding: 6,
    borderRadius: 8,
  },
  iconPressed: {
    opacity: 0.6,
  },
  codeBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 2,
    borderRadius: 6,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  topScoreRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 6,
    gap: 8,
  },
  topScoreButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topScoreButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  redTopScore: {
    backgroundColor: '#EF3735',
  },
  blueTopScore: {
    backgroundColor: '#2768FF',
  },
  topScoreText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  bannerContainer: {
    height: 64,
    marginVertical: 4,
    width: '100%',
    overflow: 'hidden',
  },
  cardsRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 4,
    gap: 8,
    alignItems: 'stretch',
  },
  cardWrapper: {
    flex: 1,
    position: 'relative',
    height: '100%',
    justifyContent: 'flex-end',
  },
  arrowIndicatorContainer: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  judgeCard: {
    flex: 1,
    borderRadius: 10,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  judgeCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  redCard: {
    backgroundColor: '#EF3735',
  },
  blueCard: {
    backgroundColor: '#2768FF',
  },
  judgeCardText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 76,
  },
  footer: {
    height: 38,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrand: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  footerBrandAccent: {
    color: '#EF3735',
  },
  footerBrandPlus: {
    color: '#EF3735',
    fontSize: 18,
    fontWeight: '900',
  },
});

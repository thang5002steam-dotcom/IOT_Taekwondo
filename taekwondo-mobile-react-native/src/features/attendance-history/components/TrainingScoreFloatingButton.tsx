import { ChevronRight } from "reicon-react-native";
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppIcon } from '@/shared/ui/AppIcon';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, effects, radii } from '@/theme';

type TrainingScoreFloatingButtonProps = {
  onPress: () => void;
};

export function TrainingScoreFloatingButton({
  onPress,
}: TrainingScoreFloatingButtonProps) {
  return (
    <View pointerEvents="box-none" style={styles.floatingWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Điểm rèn luyện"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
      >
        <Svg width={123} height={50} style={styles.gradientBackground}>
          <Defs>
            <LinearGradient id="trainingScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFF67C" stopOpacity={0.18} />
              <Stop offset="1" stopColor="#F98686" stopOpacity={0.18} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="123"
            height="50"
            rx="10"
            fill="url(#trainingScoreGradient)"
          />
        </Svg>
        <Image
          source={require('@/assets/images/diem_ren_luyen.png')}
          style={styles.image}
          contentFit="cover"
        />
        <ThemedText type="caption" style={styles.text}>
          Điểm{'\n'}rèn luyện
        </ThemedText>
        <AppIcon icon={<ChevronRight />}
          width={9}
          height={15}
          color={Colors.light.primary}
          style={styles.chevron}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    position: 'absolute',
    right: 20,
    bottom: 150,
  },
  button: {
    width: 123,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingLeft: 0,
    paddingRight: 8,
    ...effects.soft,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  image: {
    width: 34,
    height: 34,
    marginLeft: 0,
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: Colors.light.primaryPressed,
    textAlign: 'center',
    lineHeight: 15,
  },
  chevron: {
    transform: [{ rotate: '90deg' }],
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

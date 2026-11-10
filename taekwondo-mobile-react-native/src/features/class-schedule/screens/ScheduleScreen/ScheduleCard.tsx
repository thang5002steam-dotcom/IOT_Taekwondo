import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, effects, hexToRgba, radii, typography } from '@/theme';
import type { ScheduleScreenItem } from './scheduleScreen.types';

export function ScheduleCard({ schedule, onPress }: { schedule: ScheduleScreenItem; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết lịch ${schedule.branchName}, ${schedule.shiftLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <Image
        source={schedule.image}
        style={styles.cardImage}
        contentFit="cover"
        accessibilityLabel={`${schedule.branchName}, ${schedule.shiftLabel}`}
      />
      <View style={styles.cardCopy}>
        <ThemedText type="subtitle" style={styles.branchName}>
          {schedule.branchName}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.shiftLabel}>
          {schedule.shiftLabel}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.coachName}>
          {schedule.coachName}
        </ThemedText>
        <View style={styles.timePill}>
          <ThemedText type="bodySmall" style={styles.timeText}>
            {schedule.startTime} - {schedule.endTime}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 130,
    flexDirection: 'row',
    gap: 28,
    padding: 10,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    ...effects.card,
  },
  pressed: { opacity: 0.78 },
  cardImage: {
    width: 139,
    height: 110,
    borderRadius: radii.md,
    ...effects.glass,
  },
  cardCopy: {
    flex: 1,
    paddingTop: 2,
    alignItems: 'flex-start',
  },
  branchName: {
    color: Colors.light.text,
    lineHeight: 26,
  },
  shiftLabel: {
    color: Colors.light.text,
    fontFamily: typography.title.fontFamily,
    fontWeight: '600',
    lineHeight: 20,
  },
  coachName: {
    color: Colors.light.text,
    fontSize: 13,
    lineHeight: 22,
  },
  timePill: {
    minWidth: 100,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 7,
    borderRadius: radii.sm,
    backgroundColor: hexToRgba(Colors.light.primary, 0.2),
    ...effects.glass,
  },
  timeText: {
    color: Colors.light.primary,
    lineHeight: 20,
  },
});

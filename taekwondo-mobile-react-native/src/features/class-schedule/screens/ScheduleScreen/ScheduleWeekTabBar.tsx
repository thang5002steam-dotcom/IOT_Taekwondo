import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, radii } from '@/theme';
import type { Weekday } from '../../constants/class-schedule.constants';
import { scheduleWeekTabs } from './scheduleScreen.fixtures';

export function ScheduleWeekTabBar({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: Weekday;
  onSelectDay: (day: Weekday) => void;
}) {
  return (
    <View style={styles.weekTabs}>
      {scheduleWeekTabs.map((tab) => {
        const active = selectedDay === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelectDay(tab.key)}
            style={({ pressed }) => [
              styles.weekTab,
              pressed ? styles.pressed : null,
            ]}
          >
            <ThemedText
              type="bodySmall"
              style={[styles.weekLabel, active ? styles.weekLabelActive : null]}
            >
              {tab.label}
            </ThemedText>
            <ThemedText
              type="caption"
              style={[
                styles.weekCount,
                active ? styles.weekLabelActive : null,
                tab.count ? null : styles.weekCountEmpty,
              ]}
            >
              {tab.count ? `(${tab.count})` : ' '}
            </ThemedText>
            {active ? <View style={styles.weekIndicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  weekTabs: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
    backgroundColor: Colors.light.background,
  },
  weekTab: {
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  weekLabel: {
    color: Colors.light.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  weekCount: {
    color: Colors.light.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  weekCountEmpty: {
    opacity: 0,
  },
  weekLabelActive: {
    color: Colors.light.primary,
  },
  weekIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 56,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});

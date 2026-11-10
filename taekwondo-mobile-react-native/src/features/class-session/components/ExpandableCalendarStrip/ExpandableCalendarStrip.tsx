import { useEffect, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ChevronLeft, ChevronRight } from 'reicon-react-native';

import { AppIcon } from '@/shared/ui/AppIcon';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, typography } from '@/theme';
import {
  formatToDateString,
  getDaysOfMonth,
  parseDateString,
  type CalendarDayInfo,
} from '../../domain/calendarDate';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const ROW_HEIGHT = 52; // 48px cell height + 4px margin

export interface ExpandableCalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  isExpanded: boolean;
  onToggleExpanded: (expanded: boolean) => void;
  /** Map of dateString -> number of sessions on that date */
  sessionCountMap?: Record<string, number>;
}

export function ExpandableCalendarStrip({
  selectedDate,
  onSelectDate,
  isExpanded,
  onToggleExpanded,
  sessionCountMap = {},
}: ExpandableCalendarStripProps) {
  const selectedDateObj = useMemo(() => parseDateString(selectedDate), [selectedDate]);
  const year = selectedDateObj.getFullYear();
  const month = selectedDateObj.getMonth();

  const monthDays = useMemo(() => {
    return getDaysOfMonth(year, month);
  }, [year, month]);

  const totalRows = Math.max(1, Math.ceil(monthDays.length / 7));
  const minHeight = ROW_HEIGHT;
  const maxHeight = totalRows * ROW_HEIGHT;

  const selectedIndex = monthDays.findIndex((d) => d.dateString === selectedDate);
  const selectedRowIndex = selectedIndex >= 0 ? Math.floor(selectedIndex / 7) : 0;

  const progress = useSharedValue(isExpanded ? 1 : 0);
  const context = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withSpring(isExpanded ? 1 : 0, {
        damping: 22,
        stiffness: 200,
        mass: 0.8,
      }),
    );
  }, [isExpanded, progress]);

  const handleToggle = () => {
    const nextState = !isExpanded;
    const target = nextState ? 1 : 0;
    progress.set(
      withSpring(
        target,
        { damping: 22, stiffness: 200, mass: 0.8 },
        (finished) => {
          if (finished) {
            scheduleOnRN(onToggleExpanded, nextState);
          }
        },
      ),
    );
  };

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-8, 8])
      .onStart(() => {
        context.set(progress.get());
      })
      .onUpdate((event) => {
        const heightDelta = maxHeight - minHeight;
        if (heightDelta > 0) {
          const delta = event.translationY / heightDelta;
          progress.set(clamp(context.get() + delta, 0, 1));
        }
      })
      .onEnd((event) => {
        let shouldExpand = isExpanded;
        if (event.velocityY > 400) {
          shouldExpand = true;
        } else if (event.velocityY < -400) {
          shouldExpand = false;
        } else {
          shouldExpand = progress.get() > 0.4;
        }

        const target = shouldExpand ? 1 : 0;
        const heightDelta = maxHeight - minHeight;
        const velocityNorm = heightDelta > 0 ? event.velocityY / heightDelta : 0;

        progress.set(
          withSpring(
            target,
            {
              damping: 22,
              stiffness: 200,
              mass: 0.8,
              velocity: velocityNorm,
            },
            (finished) => {
              if (finished) {
                scheduleOnRN(onToggleExpanded, shouldExpand);
              }
            },
          ),
        );
      });
  }, [isExpanded, maxHeight, minHeight, onToggleExpanded, progress, context]);

  const gridContainerAnimatedStyle = useAnimatedStyle(() => {
    const currentHeight = minHeight + (maxHeight - minHeight) * progress.get();
    return {
      height: currentHeight,
      overflow: 'hidden',
    };
  });

  const gridContentAnimatedStyle = useAnimatedStyle(() => {
    const offset = -selectedRowIndex * ROW_HEIGHT * (1 - progress.get());
    return {
      transform: [{ translateY: offset }],
    };
  });

  const handlePrev = () => {
    if (isExpanded) {
      const prevMonthDate = new Date(year, month - 1, 1);
      onSelectDate(formatToDateString(prevMonthDate));
    } else {
      const prevWeekDate = new Date(selectedDateObj);
      prevWeekDate.setDate(selectedDateObj.getDate() - 7);
      onSelectDate(formatToDateString(prevWeekDate));
    }
  };

  const handleNext = () => {
    if (isExpanded) {
      const nextMonthDate = new Date(year, month + 1, 1);
      onSelectDate(formatToDateString(nextMonthDate));
    } else {
      const nextWeekDate = new Date(selectedDateObj);
      nextWeekDate.setDate(selectedDateObj.getDate() + 7);
      onSelectDate(formatToDateString(nextWeekDate));
    }
  };

  return (
    <View style={styles.container}>
      {/* Month Title Header with < > Navigation */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trở về trước"
          hitSlop={12}
          onPress={handlePrev}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <AppIcon
            icon={<ChevronLeft />}
            size={16}
            color={Colors.light.textSecondary}
          />
        </Pressable>

        <ThemedText style={styles.monthTitle}>
          Tháng {month + 1}/{year}
        </ThemedText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tiếp theo"
          hitSlop={12}
          onPress={handleNext}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <AppIcon
            icon={<ChevronRight />}
            size={16}
            color={Colors.light.textSecondary}
          />
        </Pressable>
      </View>

      {/* Weekday Names Header (T2 -> CN) */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((dayLabel) => (
          <View key={dayLabel} style={styles.weekdayCol}>
            <ThemedText style={styles.weekdayLabel}>{dayLabel}</ThemedText>
          </View>
        ))}
      </View>

      {/* Interactive Smooth Expandable Days Grid */}
      <Animated.View style={gridContainerAnimatedStyle}>
        <Animated.View style={[styles.grid, gridContentAnimatedStyle]}>
          {monthDays.map((dayInfo: CalendarDayInfo) => {
            const isSelected = dayInfo.dateString === selectedDate;
            const isToday = dayInfo.isToday;
            const count = sessionCountMap[dayInfo.dateString] || 0;
            const isFaded = !dayInfo.isCurrentMonth;

            return (
              <Pressable
                key={dayInfo.dateString}
                accessibilityRole="button"
                accessibilityLabel={`${dayInfo.dateString}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectDate(dayInfo.dateString)}
                style={({ pressed }) => [
                  styles.dayCell,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.dayCircle,
                    isToday && !isSelected && styles.dayCircleToday,
                    isSelected && styles.dayCircleSelected,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.dayText,
                      isFaded && styles.dayTextFaded,
                      isToday && !isSelected && styles.dayTextToday,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {dayInfo.dayOfMonth}
                  </ThemedText>
                </View>

                {/* Dots for sessions */}
                <View style={styles.dotsContainer}>
                  {count > 0 ? (
                    <>
                      <View
                        style={[
                          styles.dot,
                          isSelected && styles.dotSelected,
                        ]}
                      />
                      {count > 1 ? (
                        <View
                          style={[
                            styles.dot,
                            isSelected && styles.dotSelected,
                          ]}
                        />
                      ) : null}
                    </>
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </Animated.View>

      {/* Drag handle to expand/collapse via pan gesture or tap */}
      <GestureDetector gesture={panGesture}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 'Thu gọn lịch' : 'Mở rộng lịch'}
          hitSlop={14}
          onPress={handleToggle}
          style={styles.handleContainer}
        >
          <View style={styles.handleBar} />
        </Pressable>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    color: Colors.light.primary,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: typography.title.fontFamily,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: Colors.light.primary,
  },
  dayCircleToday: {
    backgroundColor: '#FEE2E2', // Soft red background for today
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  dayTextFaded: {
    color: Colors.light.divider,
  },
  dayTextToday: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: Colors.light.surface,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 6,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0EA5E9',
  },
  dotSelected: {
    backgroundColor: '#0EA5E9',
  },
  emptyDot: {
    height: 4,
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.divider,
  },
  pressed: {
    opacity: 0.7,
  },
});

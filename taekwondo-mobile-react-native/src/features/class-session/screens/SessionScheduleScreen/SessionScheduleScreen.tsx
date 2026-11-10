import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DefaultHeaderActions } from "@/routes/navigation/components/DefaultHeaderActions";
import BottomTabScreenLayout, {
  BOTTOM_TAB_SPACE,
} from "@/routes/navigation/layouts/BottomTabScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors } from "@/theme";
import { asHref } from "@/features/student-commerce/utils/studentCommerceUtils";
import type { ClassSessionCalendarResponse } from "../../api/class-session.dto";
import { ExpandableCalendarStrip } from "../../components/ExpandableCalendarStrip";
import { SessionCalendarCard } from "../../components/SessionCalendarCard";
import { SessionDetailSheet } from "../../components/SessionDetailSheet";
import {
  formatToDateString,
  formatVietnameseDayHeader,
  getDaysOfMonth,
  getDaysOfWeek,
  parseDateString,
} from "../../domain/calendarDate";
import { useClassSessionCalendarQuery } from "../../hooks/useClassSessionCalendarQuery";

export default function SessionScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatToDateString(new Date()),
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedSessionDetail, setSelectedSessionDetail] =
    useState<ClassSessionCalendarResponse | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const datePositions = useRef<Record<string, number>>({});

  // Determine query range based on selected date & expanded status
  // Backend allows max 42 days (fromDate <= toDate)
  const queryRange = useMemo(() => {
    const selectedObj = parseDateString(selectedDate);
    if (isExpanded) {
      // Entire month grid (up to 42 days)
      const monthDays = getDaysOfMonth(
        selectedObj.getFullYear(),
        selectedObj.getMonth(),
      );
      const fromDate = monthDays[0].dateString;
      const toDate = monthDays[monthDays.length - 1].dateString;
      return { fromDate, toDate };
    } else {
      // 7 days of the week
      const weekDays = getDaysOfWeek(selectedObj);
      const fromDate = weekDays[0].dateString;
      const toDate = weekDays[weekDays.length - 1].dateString;
      return { fromDate, toDate };
    }
  }, [selectedDate, isExpanded]);

  const {
    data: calendarSessions,
    isLoading,
    error,
  } = useClassSessionCalendarQuery(queryRange);

  // Create session count map for calendar dots
  const sessionCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!calendarSessions) return map;
    for (const session of calendarSessions) {
      map[session.sessionDate] = (map[session.sessionDate] || 0) + 1;
    }
    return map;
  }, [calendarSessions]);

  // Group sessions to display
  const groupedSessions = useMemo(() => {
    if (!calendarSessions) return [];

    // Group all returned sessions by date
    const groups: {
      dateString: string;
      sessions: ClassSessionCalendarResponse[];
    }[] = [];
    const dateMap = new Map<string, ClassSessionCalendarResponse[]>();

    for (const session of calendarSessions) {
      if (!dateMap.has(session.sessionDate)) {
        dateMap.set(session.sessionDate, []);
      }
      dateMap.get(session.sessionDate)!.push(session);
    }

    // Sort dates chronologically
    const sortedDates = Array.from(dateMap.keys()).sort();

    for (const dateStr of sortedDates) {
      groups.push({
        dateString: dateStr,
        sessions: dateMap.get(dateStr)!,
      });
    }

    return groups;
  }, [calendarSessions]);

  const initialScrolledRef = useRef(false);

  const findTargetScrollY = (targetDate: string): number | undefined => {
    if (datePositions.current[targetDate] !== undefined) {
      return datePositions.current[targetDate];
    }
    // Fallback to the closest date >= targetDate, or the latest past date
    const recordedDates = Object.keys(datePositions.current).sort();
    if (recordedDates.length === 0) return undefined;

    const upcomingDate = recordedDates.find((d) => d >= targetDate);
    if (upcomingDate && datePositions.current[upcomingDate] !== undefined) {
      return datePositions.current[upcomingDate];
    }
    const lastDate = recordedDates[recordedDates.length - 1];
    return datePositions.current[lastDate];
  };

  const scrollToDate = (dateStr: string, animated = true) => {
    const yOffset = findTargetScrollY(dateStr);
    if (yOffset !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: Math.max(0, yOffset - 10),
        animated,
      });
    }
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    scrollToDate(dateStr);
  };

  useEffect(() => {
    initialScrolledRef.current = false;
    datePositions.current = {};
  }, [queryRange]);

  useEffect(() => {
    if (selectedDate && datePositions.current[selectedDate] !== undefined) {
      scrollToDate(selectedDate);
    }
  }, [selectedDate]);

  return (
    <>
      <BottomTabScreenLayout
        title="Thời khoá biểu"
        activeTab="schedule"
        rightActions={<DefaultHeaderActions color={Colors.light.surface} />}
        contentContainerStyle={styles.layoutContent}
        scrollEnabled={false}
      >
        <View style={styles.fixedHeader}>
          <ExpandableCalendarStrip
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            isExpanded={isExpanded}
            onToggleExpanded={setIsExpanded}
            sessionCountMap={sessionCountMap}
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollList}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BOTTOM_TAB_SPACE + Math.max(insets.bottom, 10) },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (!initialScrolledRef.current && Object.keys(datePositions.current).length > 0) {
              scrollToDate(selectedDate, true);
              initialScrolledRef.current = true;
            }
          }}
        >
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <ThemedText style={styles.errorText}>
                Không thể tải lịch học. Vui lòng thử lại sau.
              </ThemedText>
            </View>
          ) : groupedSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyDayHeader}>
                {formatVietnameseDayHeader(selectedDate)}
              </ThemedText>
              <ThemedText style={styles.emptyText}>
                Không có buổi học nào trong khoảng thời gian này.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.list}>
              {groupedSessions.map((group) => (
                <View
                  key={group.dateString}
                  style={styles.dateGroup}
                  onLayout={(event) => {
                    datePositions.current[group.dateString] =
                      event.nativeEvent.layout.y;
                    if (!initialScrolledRef.current) {
                      requestAnimationFrame(() => {
                        scrollToDate(selectedDate, true);
                      });
                    }
                  }}
                >
                  <ThemedText style={styles.dayHeader}>
                    {formatVietnameseDayHeader(group.dateString)}
                  </ThemedText>
                  <View style={styles.sessionCards}>
                    {group.sessions.map((session) => (
                      <SessionCalendarCard
                        key={session.classSessionId}
                        session={session}
                        onPress={() => setSelectedSessionDetail(session)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </BottomTabScreenLayout>

      <SessionDetailSheet
        session={selectedSessionDetail}
        visible={!!selectedSessionDetail}
        onClose={() => setSelectedSessionDetail(null)}
        onViewDetail={(session) =>
          router.push(asHref(`/class-sessions/${session.classSessionId}`))
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  layoutContent: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  fixedHeader: {
    zIndex: 10,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  list: {
    gap: 20,
  },
  dateGroup: {
    gap: 10,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 2,
  },
  sessionCards: {
    gap: 10,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: Colors.light.error,
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: 20,
    gap: 12,
  },
  emptyDayHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
  },
  emptyText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
});

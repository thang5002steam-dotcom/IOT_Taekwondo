import { Flag } from "reicon-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { calendarColors, radii } from "@/theme";
import type { ClassSessionCalendarResponse } from "../../api/class-session.dto";

export interface SessionCalendarCardProps {
  session: ClassSessionCalendarResponse;
  onPress?: () => void;
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

interface CardPalette {
  accentBar: string;
  title: string;
  flagIcon: string;
}

const CARD_PALETTES: CardPalette[] = [
  {
    accentBar: calendarColors.cyan.accent,
    title: calendarColors.cyan.title,
    flagIcon: calendarColors.cyan.icon,
  },
  {
    accentBar: calendarColors.royalBlue.accent,
    title: calendarColors.royalBlue.title,
    flagIcon: calendarColors.royalBlue.icon,
  },
  {
    accentBar: calendarColors.teal.accent,
    title: calendarColors.teal.title,
    flagIcon: calendarColors.teal.icon,
  },
  {
    accentBar: calendarColors.skyBlue.accent,
    title: calendarColors.skyBlue.title,
    flagIcon: calendarColors.skyBlue.icon,
  },
];

function getCardPalette(session: ClassSessionCalendarResponse): CardPalette {
  if (session.status === "CANCELLED") {
    return {
      accentBar: calendarColors.muted.accent,
      title: calendarColors.muted.title,
      flagIcon: calendarColors.muted.icon,
    };
  }

  let hash = 0;
  const str =
    session.courseId || session.courseName || session.classSessionId || "";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CARD_PALETTES.length;
  return CARD_PALETTES[index];
}

export function SessionCalendarCard({
  session,
  onPress,
}: SessionCalendarCardProps) {
  const palette = getCardPalette(session);
  const timeRange = `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`;
  const isCancelled = session.status === "CANCELLED";

  const locationOrCoach = session.primaryCoach?.fullName
    ? `HLV ${session.primaryCoach.fullName}`
    : "Sân tập Taekwondo Văn Quán";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${session.courseName}, ${timeRange}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isCancelled && styles.cardCancelled,
        pressed && styles.cardPressed,
      ]}
    >
      <View
        style={[styles.accentBar, { backgroundColor: palette.accentBar }]}
      />
      <View style={styles.cardContent}>
        <ThemedText
          type="subtitle"
          style={[styles.courseName, { color: palette.title }]}
          numberOfLines={2}
        >
          {session.courseName}
        </ThemedText>

        <ThemedText style={styles.timeText}>{timeRange}</ThemedText>

        <View style={styles.locationRow}>
          <AppIcon icon={<Flag />} size={13} color={palette.flagIcon} />
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {locationOrCoach}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: calendarColors.cardBackground,
    borderRadius: radii.sm + 2,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "stretch",
  },
  cardCancelled: {
    opacity: 0.6,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  accentBar: {
    width: 3.5,
    borderRadius: 2,
    alignSelf: "stretch",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    gap: 5,
  },
  courseName: {
    fontSize: 15.5,
    fontWeight: "700",
    lineHeight: 21,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
  },
  locationText: {
    fontSize: 13.5,
    color: "#334155",
    fontWeight: "400",
    lineHeight: 18,
  },
});

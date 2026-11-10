import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import type { ClassSessionCalendarResponse } from "@/features/class-session/api/class-session.dto";
import { SessionStatusLabel } from "@/features/class-session/constants/class-session.constants";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii, typography } from "@/theme";

export interface SessionCalendarCardProps {
  session: ClassSessionCalendarResponse;
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

// Default placeholder image if course doesn't specify
const DEFAULT_CLASS_IMAGE = require("@/features/class-schedule/assets/images/class-basic.png");

export function SessionCalendarCard({ session }: SessionCalendarCardProps) {
  const coachName = session.primaryCoach?.fullName
    ? `HLV ${session.primaryCoach.fullName}`
    : "HLV Phụ trách";

  const timeRange = `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`;
  const isCancelled = session.status === "CANCELLED";

  return (
    <View style={[styles.card, isCancelled && styles.cardCancelled]}>
      <Image
        source={DEFAULT_CLASS_IMAGE}
        style={styles.cardImage}
        contentFit="cover"
        accessibilityLabel={session.courseName}
      />
      <View style={styles.cardCopy}>
        <ThemedText type="subtitle" style={styles.courseName} numberOfLines={1}>
          {session.courseName}
        </ThemedText>
        <ThemedText
          type="bodySmall"
          style={styles.levelLabel}
          numberOfLines={1}
        >
          {SessionStatusLabel[session.status] || "Lịch học"}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.coachName} numberOfLines={1}>
          {coachName}
        </ThemedText>
        <View style={styles.timePill}>
          <ThemedText type="bodySmall" style={styles.timeText}>
            {timeRange}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 130,
    flexDirection: "row",
    gap: 20,
    padding: 10,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    ...effects.card,
  },
  cardCancelled: {
    opacity: 0.6,
  },
  cardImage: {
    width: 130,
    height: 110,
    borderRadius: radii.md,
    ...effects.glass,
  },
  cardCopy: {
    flex: 1,
    paddingTop: 2,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  courseName: {
    color: Colors.light.text,
    lineHeight: 24,
    fontWeight: "700",
  },
  levelLabel: {
    color: Colors.light.text,
    fontFamily: typography.title.fontFamily,
    fontWeight: "600",
    lineHeight: 20,
  },
  coachName: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  timePill: {
    minWidth: 100,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    backgroundColor: hexToRgba(Colors.light.primary, 0.15),
    ...effects.glass,
  },
  timeText: {
    color: Colors.light.primary,
    fontWeight: "600",
    lineHeight: 20,
  },
});

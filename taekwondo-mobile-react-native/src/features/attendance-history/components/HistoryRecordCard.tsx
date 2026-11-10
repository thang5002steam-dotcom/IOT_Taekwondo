import { StyleSheet, View } from "react-native";
import { Clock, Location, User } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

import type {
  HistoryRecordTone,
  HistoryRecordViewModel,
} from "../domain/historyMappers";

type HistoryRecordCardProps = {
  record: HistoryRecordViewModel;
};

const toneColors: Record<
  HistoryRecordTone,
  { text: string; background: string }
> = {
  success: { text: "#16A34A", background: "#EAFCF1" },
  warning: { text: "#D97706", background: "#FEEFDD" },
  error: { text: "#DC2626", background: "#FCDEDE" },
  neutral: { text: Colors.light.textSecondary, background: "#F3F4F6" },
};

export function HistoryRecordCard({ record }: HistoryRecordCardProps) {
  const tone = toneColors[record.tone];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="body" numberOfLines={1} style={styles.nameText}>
          {record.name}
        </ThemedText>
        <View
          style={[
            styles.badge,
            { borderColor: tone.text, backgroundColor: tone.background },
          ]}
        >
          <ThemedText
            type="body"
            style={[styles.badgeText, { color: tone.text }]}
          >
            {record.badgeLabel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <MetaItem icon={<Location />} label={record.branchLabel} />
        <View style={styles.verticalDivider} />
        <MetaItem icon={<Clock />} label={record.shiftLabel} />
        <View style={styles.verticalDivider} />
        <MetaItem icon={<User />} label={record.statusLabel} />
      </View>

      {record.note && (
        <View
          style={[
            styles.noteBox,
            { borderColor: tone.text, backgroundColor: tone.background },
          ]}
        >
          <ThemedText
            type="body"
            style={[styles.noteTitle, { color: tone.text }]}
          >
            {record.noteTitle}
          </ThemedText>
          <ThemedText type="bodySmall" style={styles.note}>
            {record.note}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function MetaItem({ icon, label }: { icon: AppIconElement; label: string }) {
  return (
    <View style={styles.metaItem}>
      <AppIcon icon={icon} size={22} color={Colors.light.primary} />
      <ThemedText type="body" numberOfLines={1} style={styles.metaText}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 17,
    paddingBottom: 16,
    ...effects.soft,
  },
  cardHeader: {
    minHeight: 41,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 8,
  },
  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  nameText: {
    color: Colors.light.text,
  },
  dateSubText: {
    color: Colors.light.textSecondary,
  },
  dateText: {
    color: Colors.light.text,
  },
  badge: {
    minWidth: 84,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
  },
  badgeText: {
    textAlign: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
  metaRow: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.text,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 29,
    marginHorizontal: 9,
    backgroundColor: hexToRgba(Colors.light.divider, 0.8),
  },
  noteBox: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noteTitle: {
    marginBottom: 1,
  },
  note: {
    color: Colors.light.text,
  },
});

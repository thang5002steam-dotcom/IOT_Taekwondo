import { Clock, InfoCircle, NoteText, Trophy } from "reicon-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, hexToRgba, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

import { trainingScoreMock } from "../data/history.mock";

type TrainingScoreSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const scoreSectionIcons = {
  clockOutline: <Clock />,
  noteText: <NoteText />,
  cup: <Trophy />,
} as const;

export function TrainingScoreSheet({
  visible,
  onClose,
}: TrainingScoreSheetProps) {
  return (
    <BottomSheetWindow
      visible={visible}
      title="Điểm rèn luyện"
      heightRatio={0.88}
      accessibilityLabel="Điểm rèn luyện"
      contentContainerStyle={styles.content}
      onClose={onClose}
    >
      <View style={styles.summaryRow}>
        <View style={styles.statusPill}>
          <ThemedText type="body" style={styles.statusText}>
            {trainingScoreMock.statusLabel}
          </ThemedText>
        </View>
        <ThemedText type="body" style={styles.quarterLabel}>
          {trainingScoreMock.quarterLabel}
        </ThemedText>
        <AppIcon icon={<InfoCircle />} size={30} color={Colors.light.primary} />
      </View>

      {trainingScoreMock.sections.map((section) => (
        <TrainingScoreSection
          key={section.title}
          section={{ ...section, icon: scoreSectionIcons[section.icon] }}
        />
      ))}

      <View style={styles.totalCard}>
        <ThemedText type="body" style={styles.totalText}>
          {trainingScoreMock.totalLabel}
        </ThemedText>
        <ThemedText type="body" style={styles.totalText}>
          {trainingScoreMock.totalValue}
        </ThemedText>
      </View>
    </BottomSheetWindow>
  );
}

function TrainingScoreSection({
  section,
}: {
  section: {
    title: string;
    icon: AppIconElement;
    total: string;
    rows: { label: string; value: string }[];
  };
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardInner}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleGroup}>
            <AppIcon icon={section.icon}
              size={30}
              color={Colors.light.surface}
            />
            <ThemedText type="body" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
          </View>
          {section.total ? (
            <ThemedText type="body" style={styles.sectionTotal}>
              {section.total}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.rows}>
          {section.rows.map((row, index) => (
            <TrainingScoreRow
              key={row.label}
              row={row}
              showDivider={index < section.rows.length - 1}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function TrainingScoreRow({
  row,
  showDivider,
}: {
  row: { label: string; value: string };
  showDivider: boolean;
}) {
  const { label, meta } = splitScoreLabel(row.label);

  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLabelGroup}>
        <ThemedText type="body" numberOfLines={2} style={styles.scoreLabel}>
          {label}
        </ThemedText>
        {meta ? (
          <ThemedText type="bodySmall" style={styles.scoreMeta}>
            {meta}
          </ThemedText>
        ) : null}
      </View>
      {row.value ? (
        <ThemedText type="body" style={styles.scoreValue}>
          {row.value}
        </ThemedText>
      ) : null}
      {showDivider ? <View style={styles.rowDivider} /> : null}
    </View>
  );
}

function splitScoreLabel(label: string) {
  const match = label.match(/^(.*?)(\s*\([^)]*\))$/);

  if (!match) {
    return { label };
  }

  return {
    label: match[1].trim(),
    meta: match[2].trim(),
  };
}

const scoreSectionBackground = hexToRgba(Colors.light.primary, 0.1);
const statusWarningColor = "#D97706";

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingBottom: 34,
    gap: 20,
  },
  summaryRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusPill: {
    minWidth: 109,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: hexToRgba(statusWarningColor, 0.15),
  },
  statusText: {
    color: statusWarningColor,
  },
  quarterLabel: {
    flex: 1,
    minWidth: 90,
    color: Colors.light.text,
    textAlign: "right",
  },
  sectionCard: {
    borderRadius: radii.md,
    // Opaque base: a translucent card background lets the card shadow show
    // through it, which reads as a dark gradient ending right where the
    // header band meets the white rows.
    backgroundColor: Colors.light.surface,
    ...effects.card,
  },
  sectionCardInner: {
    overflow: "hidden",
    borderRadius: radii.md,
    backgroundColor: scoreSectionBackground,
  },
  sectionHeader: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 11,
    backgroundColor: scoreSectionBackground,
  },
  sectionTitleGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    flex: 1,
    color: Colors.light.surface,
  },
  sectionTotal: {
    color: Colors.light.surface,
    textAlign: "right",
  },
  rows: {
    overflow: "hidden",
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    backgroundColor: Colors.light.surface,
  },
  scoreRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 9,
  },
  scoreLabelGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  scoreLabel: {
    flexShrink: 1,
    color: Colors.light.text,
  },
  scoreMeta: {
    flexShrink: 0,
    color: "#CACCCD",
    fontSize: 12,
    lineHeight: 16,
  },
  scoreValue: {
    minWidth: 42,
    color: Colors.light.text,
    textAlign: "right",
  },
  rowDivider: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#CACCCD",
  },
  totalCard: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    backgroundColor: scoreSectionBackground,
    paddingHorizontal: 10,
    ...effects.card,
  },
  totalText: {
    color: Colors.light.surface,
  },
});

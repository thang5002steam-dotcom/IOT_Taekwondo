import { Pressable, StyleSheet, View } from "react-native";

import { Colors, Spacing, radii } from "@/theme";
import { ThemedText } from "@/shared/ui/ThemedText";
import type { CounterMode, ParticipantSlot } from "../types/kneeCounter.types";

type KneeCounterDashboardProps = { slots: ParticipantSlot[]; detectedCount: number; totalReps: number; passCount: number; groupPassCount: number; synchronizedGroupPass: boolean; mode: CounterMode; status: string; onReset: () => void; onExport: () => void };

export function KneeCounterDashboard({ slots, detectedCount, totalReps, passCount, groupPassCount, synchronizedGroupPass, mode, status, onReset, onExport }: KneeCounterDashboardProps) {
  return <View style={styles.panel}>
    <View style={styles.resultHeader}><View><ThemedText type="title" style={styles.title}>Kết quả theo vận động viên</ThemedText><ThemedText type="bodySmall" style={styles.secondary}>{detectedCount} đang được theo dõi · {status}</ThemedText></View><ThemedText type="subtitle" style={styles.total}>{mode === "individual" ? totalReps : mode === "current-group-pass" ? groupPassCount : synchronizedGroupPass ? "Đạt" : "Chờ"}</ThemedText></View>
    <View style={styles.participants}>{slots.map((slot, index) => <ParticipantCard key={slot.participantId} slot={slot} index={index} />)}</View>
    <View style={styles.actionRow}><Pressable accessibilityRole="button" accessibilityLabel="Đặt lại bộ đếm" onPress={onReset} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><ThemedText type="action" style={styles.title}>Đặt lại</ThemedText></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Xuất CSV" onPress={onExport} style={({ pressed }) => [styles.action, styles.primaryAction, pressed && styles.pressed]}><ThemedText type="action" style={styles.primaryText}>Xuất CSV</ThemedText></Pressable></View>
  </View>;
}

function ParticipantCard({ slot, index }: { slot: ParticipantSlot; index: number }) {
  const accent = index % 2 === 0 ? Colors.light.primary : Colors.light.info;
  const total = slot.leftReps + slot.rightReps;
  const tracked = slot.trackId !== null;
  return <View style={[styles.participantCard, { borderLeftColor: accent }]}><View style={styles.participantHeading}><View style={styles.nameRow}><View style={[styles.indexBadge, { backgroundColor: accent }]}><ThemedText type="caption" style={styles.primaryText}>{index + 1}</ThemedText></View><ThemedText type="title" style={styles.title}>{slot.label}</ThemedText></View><View style={styles.tracking}><View style={[styles.trackingDot, { backgroundColor: tracked ? Colors.light.success : Colors.light.divider }]} /><ThemedText type="caption" style={styles.secondary}>{slot.status}</ThemedText></View></View><View style={styles.countRow}><Count label={`Trái · ${slot.leftPhase}`} value={slot.leftReps} /><Count label={`Phải · ${slot.rightPhase}`} value={slot.rightReps} /><Count label="Tổng" value={total} accent={accent} /></View></View>;
}

function Count({ label, value, accent }: { label: string; value: number; accent?: string }) { return <View style={styles.count}><ThemedText type="caption" style={styles.secondary}>{label}</ThemedText><ThemedText type="subtitle" style={[styles.title, accent ? { color: accent } : null]}>{value}</ThemedText></View>; }

const styles = StyleSheet.create({
  panel: { gap: Spacing.three, padding: Spacing.three, backgroundColor: Colors.light.surface, borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.two }, title: { color: Colors.light.text }, secondary: { color: Colors.light.textSecondary }, total: { color: Colors.light.primary },
  participants: { gap: Spacing.two }, participantCard: { gap: Spacing.two, padding: Spacing.two, borderRadius: radii.md, borderWidth: 1, borderLeftWidth: 4, borderColor: Colors.light.divider, backgroundColor: Colors.light.background }, participantHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.two }, nameRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two }, indexBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" }, tracking: { flexDirection: "row", alignItems: "center", gap: Spacing.one }, trackingDot: { width: 8, height: 8, borderRadius: 4 },
  countRow: { flexDirection: "row", gap: Spacing.one }, count: { flex: 1, minHeight: 50, alignItems: "center", justifyContent: "center", gap: 2, borderRadius: radii.md, backgroundColor: Colors.light.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider }, actionRow: { flexDirection: "row", gap: Spacing.two }, action: { minHeight: 48, flex: 1, alignItems: "center", justifyContent: "center", borderRadius: radii.md, borderWidth: 1, borderColor: Colors.light.divider, paddingHorizontal: Spacing.three }, primaryAction: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary }, primaryText: { color: Colors.light.surface }, pressed: { opacity: 0.78 },
});

import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, Spacing, radii } from "@/theme";
import type { AnkleReviewCandidate } from "../types/kneeCounter.types";

export function AnkleReviewQueue({ candidates, onResolve }: { candidates: AnkleReviewCandidate[]; onResolve: (id: string, decision: "ACCEPT" | "REJECT") => void }) {
  const pending = candidates.filter((candidate) => candidate.decision === "PENDING");
  if (!pending.length) return null;
  return <View style={styles.card} accessibilityLiveRegion="polite">
    <ThemedText type="title" style={styles.title}>Cần xem lại ({pending.length})</ThemedText>
    <ThemedText type="caption" style={styles.description}>Các lượt này chưa được cộng điểm tự động.</ThemedText>
    {pending.map((candidate) => <View key={candidate.id} style={styles.row}>
      <View style={styles.copy}><ThemedText type="bodySmall" style={styles.name}>{candidate.participantId} · chân {candidate.leg === "left" ? "trái" : "phải"}</ThemedText><ThemedText type="caption" style={styles.reason}>{candidate.reason.replaceAll("_", " ")}</ThemedText></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Chấp nhận lượt đá" onPress={() => onResolve(candidate.id, "ACCEPT")} style={({ pressed }) => [styles.accept, pressed && styles.pressed]}><ThemedText type="caption" style={styles.acceptText}>Chấp nhận</ThemedText></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Từ chối lượt đá" onPress={() => onResolve(candidate.id, "REJECT")} style={({ pressed }) => [styles.reject, pressed && styles.pressed]}><ThemedText type="caption" style={styles.rejectText}>Từ chối</ThemedText></Pressable>
    </View>)}
  </View>;
}

const styles = StyleSheet.create({ card: { gap: Spacing.two, padding: Spacing.three, borderRadius: radii.lg, backgroundColor: Colors.light.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: "#D97706" }, title: { color: Colors.light.text }, description: { color: Colors.light.textSecondary }, row: { flexDirection: "row", alignItems: "center", gap: Spacing.one, paddingTop: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider }, copy: { flex: 1, gap: 2 }, name: { color: Colors.light.text }, reason: { color: "#B45309" }, accept: { minHeight: 40, justifyContent: "center", paddingHorizontal: Spacing.two, borderRadius: radii.md, backgroundColor: "#16A34A" }, reject: { minHeight: 40, justifyContent: "center", paddingHorizontal: Spacing.two, borderRadius: radii.md, borderWidth: 1, borderColor: Colors.light.divider }, acceptText: { color: Colors.light.surface }, rejectText: { color: Colors.light.textSecondary }, pressed: { opacity: .78 } });

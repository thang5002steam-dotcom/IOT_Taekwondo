import { Pressable, StyleSheet, View } from "react-native";

import { Colors, Spacing, radii } from "@/theme";
import { ThemedText } from "@/shared/ui/ThemedText";
import type { CameraFpsOption, KneeCounterSessionConfig } from "../types/kneeCounter.types";

type AnalysisSettingsProps = {
  config: KneeCounterSessionConfig;
  backendOptions: string[];
  cameraLabels?: string[];
  selectedCameraId?: string;
  expanded: boolean;
  onToggle: () => void;
  onConfigChange: (patch: Partial<KneeCounterSessionConfig>) => void;
  onCameraChange?: (deviceId: string) => void;
  cameraFps?: CameraFpsOption;
  onCameraFpsChange?: (fps: CameraFpsOption) => void;
  cameraFpsOptions?: CameraFpsOption[];
};

export function AnalysisSettings({ config, backendOptions, cameraLabels = [], selectedCameraId, expanded, onToggle, onConfigChange, onCameraChange, cameraFps = 30, onCameraFpsChange, cameraFpsOptions = [] }: AnalysisSettingsProps) {
  return <View style={styles.panel}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onToggle} style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
      <View><ThemedText type="title" style={styles.title}>Cài đặt phân tích</ThemedText><ThemedText type="caption" style={styles.summary}>Tự nhận tối đa 6 người · mốc {config.measurementLandmark === "knee" ? "đầu gối" : "cổ chân"} · ngưỡng {config.thresholdPercent}% · FPS {cameraFpsOptions.length ? `${cameraFps}` : "chưa đọc"}</ThemedText></View>
      <ThemedText type="title" style={styles.chevron}>{expanded ? "⌃" : "⌄"}</ThemedText>
    </Pressable>
    {expanded ? <View style={styles.body}>
      <ControlGroup title="Mốc đếm"><OptionRow values={["Đầu gối", "Cổ chân"]} selected={config.measurementLandmark === "knee" ? "Đầu gối" : "Cổ chân"} onSelect={(value) => onConfigChange({ measurementLandmark: value === "Đầu gối" ? "knee" : "ankle" })} /></ControlGroup>
      {config.measurementLandmark === "knee" ? <ControlGroup title={`Ngưỡng đầu gối: ${config.thresholdPercent}%`}><OptionRow values={[-40, -35, -30, -25, -20, -10, 0, 10, 20, 30].map((value) => `${value}%`)} selected={`${config.thresholdPercent}%`} onSelect={(value) => onConfigChange({ thresholdPercent: Number.parseInt(value, 10) })} /></ControlGroup> : <ControlGroup title="Mốc cổ chân"><ThemedText type="bodySmall" style={styles.summary}>Vạch đếm theo hông từng người · xác nhận khi chân trở về vị trí.</ThemedText></ControlGroup>}
      <ControlGroup title="Chế độ đếm"><OptionRow values={["Cá nhân", "Nhóm đạt", "Đồng bộ"]} selected={config.mode === "individual" ? "Cá nhân" : config.mode === "current-group-pass" ? "Nhóm đạt" : "Đồng bộ"} onSelect={(value) => onConfigChange({ mode: value === "Cá nhân" ? "individual" : value === "Nhóm đạt" ? "current-group-pass" : "synchronized-group" })} /></ControlGroup>
      <ControlGroup title="Lật ngang camera"><OptionRow values={["Tắt", "Bật"]} selected={config.flipHorizontal ? "Bật" : "Tắt"} onSelect={(value) => onConfigChange({ flipHorizontal: value === "Bật" })} /></ControlGroup>
      <ControlGroup title={cameraFpsOptions.length ? `FPS camera mục tiêu: ${cameraFps} · áp dụng lần bật camera tiếp theo` : "FPS camera: bật camera để đọc giới hạn thiết bị"}>{cameraFpsOptions.length ? <OptionRow values={cameraFpsOptions.map((value) => `${value} FPS`)} selected={`${cameraFps} FPS`} onSelect={(value) => onCameraFpsChange?.(Number.parseInt(value, 10) as CameraFpsOption)} /> : <ThemedText type="caption" style={styles.summary}>Chưa hiển thị lựa chọn cho đến khi trình duyệt trả về giới hạn FPS thực tế.</ThemedText>}</ControlGroup>
      {cameraLabels.length > 1 ? <ControlGroup title="Camera"><OptionRow values={cameraLabels} selected={cameraLabels[cameraLabels.findIndex((label) => label === selectedCameraId)] ?? cameraLabels[0]} onSelect={(value) => onCameraChange?.(value)} /></ControlGroup> : null}
    </View> : null}
  </View>;
}

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.group}><ThemedText type="bodySmall" style={styles.groupTitle}>{title}</ThemedText>{children}</View>; }
function OptionRow({ values, selected, onSelect }: { values: string[]; selected: string; onSelect: (value: string) => void }) { return <View style={styles.options}>{values.map((value) => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: value === selected }} onPress={() => onSelect(value)} style={({ pressed }) => [styles.option, value === selected && styles.optionSelected, pressed && styles.pressed]}><ThemedText type="bodySmall" style={value === selected ? styles.optionSelectedText : styles.optionText}>{value}</ThemedText></Pressable>)}</View>; }

const styles = StyleSheet.create({
  panel: { backgroundColor: Colors.light.surface, borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.divider, overflow: "hidden" },
  header: { minHeight: 64, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.two },
  title: { color: Colors.light.text }, summary: { color: Colors.light.textSecondary, marginTop: 2 }, chevron: { color: Colors.light.primary, fontSize: 22 },
  body: { gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.light.divider },
  group: { gap: Spacing.one }, groupTitle: { color: Colors.light.text, fontWeight: "600" }, options: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
  option: { minHeight: 40, flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.two, borderRadius: radii.md, borderWidth: 1, borderColor: Colors.light.divider }, optionSelected: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary }, optionText: { color: Colors.light.textSecondary }, optionSelectedText: { color: Colors.light.surface }, pressed: { opacity: 0.78 },
});

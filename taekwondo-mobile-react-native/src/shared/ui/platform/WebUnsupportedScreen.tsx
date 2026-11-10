import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";

export function WebUnsupportedScreen({ title = "Màn hình chưa hỗ trợ trên Web", description = "Chức năng này hiện được cung cấp trên ứng dụng Android và iOS. Các màn hình Web sẽ được bật riêng khi đã có đầy đủ luồng nghiệp vụ." }: { title?: string; description?: string }) {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ThemedText type="heading" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="body" style={styles.description}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    gap: 12,
    padding: 28,
    borderRadius: radii.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
  },
  title: { color: Colors.light.text },
  description: { color: Colors.light.textSecondary, lineHeight: 24 },
});

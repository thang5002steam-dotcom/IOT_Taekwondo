import { StyleSheet } from "react-native";

import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors } from "@/theme";

import { InfoRow, SurfaceCard } from "@/shared/ui/commerce/CommercePrimitives";

export function TopUpGuideScreen() {
  return (
    <StackScreenLayout
      title="Hướng dẫn nạp tiền"
      contentContainerStyle={styles.content}
    >
      <SurfaceCard>
        <ThemedText type="title" style={styles.blackText}>
          Hướng dẫn chuyển khoản
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Vui lòng chuyển khoản theo thông tin trung tâm cung cấp, sau đó gửi
          ảnh giao dịch cho quản trị viên để được cộng tiền vào ví.
        </ThemedText>
      </SurfaceCard>
      <SurfaceCard soft>
        <InfoRow label="Nội dung" value="VQ_00123 Nguyen Van An" />
        <InfoRow label="Trạng thái" value="Chờ xác nhận thủ công" />
      </SurfaceCard>
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  blackText: {
    color: Colors.light.text,
  },
});

import { Image } from "expo-image";
import { Pen2, UserCircle } from "reicon-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import type { StudentSummaryView } from "@/features/student-commerce/types";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { StatusBadge, SurfaceCard } from "@/shared/ui/commerce/CommercePrimitives";
import { Colors, radii } from "@/theme";
import { activeEffect, effects, figmaColors } from "@/theme";

function formatBirthDate(value?: string | null) {
  if (!value) return "Chưa cập nhật ngày sinh";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function StudentProfileSummaryCard({
  student,
  avatarUrl,
  onAvatarPress,
  isAvatarUpdating = false,
}: {
  student: StudentSummaryView;
  avatarUrl?: string | null;
  onAvatarPress?: () => void;
  isAvatarUpdating?: boolean;
}) {
  return (
    <SurfaceCard style={styles.card}>
      <Pressable
        disabled={!onAvatarPress || isAvatarUpdating}
        onPress={onAvatarPress}
        accessibilityRole={onAvatarPress ? "button" : undefined}
        accessibilityLabel={onAvatarPress ? "Đổi ảnh đại diện" : undefined}
        style={({ pressed }) => [
          styles.avatarWrap,
          onAvatarPress ? activeEffect(pressed, "pressedScale") : null,
        ]}
      >
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <AppIcon icon={<UserCircle weight="Filled" />} size={46} color={figmaColors.color1} />
          )}
          {isAvatarUpdating ? (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator size="small" color={Colors.light.surface} />
            </View>
          ) : null}
        </View>
        {onAvatarPress ? (
          <View style={styles.editBadge}>
            <AppIcon icon={<Pen2 />} size={13} color={Colors.light.text} />
          </View>
        ) : null}
      </Pressable>
      <View style={styles.copy}>
        <ThemedText type="title" numberOfLines={1} style={styles.text}>
          {student.fullName}
        </ThemedText>
        <ThemedText type="bodySmall" numberOfLines={1} style={styles.text}>
          {formatBirthDate(student.birthDate)} · {student.beltLabel}
        </ThemedText>
      </View>
      <StatusBadge label={student.statusLabel} />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
    overflow: "hidden",
  },
  avatarWrap: {
    width: 56,
    height: 56,
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  editBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 23,
    height: 23,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
    ...effects.card,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  text: {
    color: Colors.light.text,
  },
});

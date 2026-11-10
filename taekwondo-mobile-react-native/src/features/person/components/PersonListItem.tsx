import { Image, Pressable, StyleSheet, View } from "react-native";
import { AwardCertificate } from "reicon-react-native";

import { SurfaceCard } from "@/shared/ui/commerce/CommercePrimitives";
import type { PersonSimpleResponse } from "@/features/person";
import { BeltLabel } from "@/features/person/constants/person.constants";
import { AppIcon } from "@/shared/ui/AppIcon";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

export function getPersonInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function PersonListItem({
  person,
  onPress,
  statusLabelMap,
}: {
  person: PersonSimpleResponse;
  onPress: () => void;
  statusLabelMap?: Record<string, string>;
}) {
  const fullName = person.fullName;
  const beltText = BeltLabel[person.currentBelt] || person.currentBelt;

  const defaultStatusLabel =
    person.status === "ACTIVE"
      ? "Đang hoạt động"
      : person.status === "INACTIVE"
        ? "Tạm dừng"
        : "Đình chỉ";

  const statusLabel = statusLabelMap?.[person.status] ?? defaultStatusLabel;
  const isNeutralStatus = person.status !== "ACTIVE";
  const subtitle = person.position?.name || "CLB Taekwondo Văn Quán";
  const faceImagePath = person.faceImagePath;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem ${fullName}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard>
        <View style={styles.row}>
          {faceImagePath ? (
            <Image source={{ uri: faceImagePath }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <ThemedText type="title" style={styles.avatarText}>
                {getPersonInitials(fullName)}
              </ThemedText>
            </View>
          )}
          <View style={styles.flex}>
            <ThemedText
              type="bodySmall"
              style={styles.blackText}
              numberOfLines={1}
            >
              {fullName}
            </ThemedText>
            <View style={styles.beltRow}>
              <AppIcon
                icon={<AwardCertificate />}
                size={15}
                color={Colors.light.primary}
              />
              <ThemedText
                type="bodySmall"
                style={styles.secondaryText}
                numberOfLines={1}
              >
                {beltText}
              </ThemedText>
            </View>
          </View>
          <StatusBadge
            label={statusLabel}
            tone={isNeutralStatus ? "neutral" : "primary"}
          />
        </View>
        <ThemedText
          type="bodySmall"
          style={styles.secondaryText}
          numberOfLines={1}
        >
          {subtitle}
        </ThemedText>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  avatarText: {
    color: Colors.light.text,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  beltRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.75,
  },
});

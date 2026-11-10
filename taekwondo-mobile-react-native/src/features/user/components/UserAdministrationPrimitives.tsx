import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import type { UserDetail, UserSimpleResponse } from "@/features/user/api/user.dto";
import type { UserStatus } from "@/features/user/constants/user.constants";
import { userStatusLabel } from "@/features/user/domain/userViewModel";
import { AdminChip, AdminListRow } from "@/shared/ui/admin/AdministrationPrimitives";
import { ThemedText } from "@/shared/ui/ThemedText";
import { initials } from "@/shared/utils/string";
import { Colors, radii } from "@/theme";

export function getPrimaryPerson(
  user?: UserSimpleResponse | UserDetail | null,
) {
  if (!user) return null;
  if ("persons" in user && Array.isArray(user.persons)) {
    return user.persons[0] ?? null;
  }
  if ("person" in user && Array.isArray(user.person)) {
    return user.person[0] ?? null;
  }
  return null;
}

export function Avatar({
  name,
  imageUrl,
  size = 42,
}: {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (imageUrl && !hasError) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[userAdminStyles.avatar, avatarStyle]}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <View style={[userAdminStyles.avatar, avatarStyle]}>
      <ThemedText
        type="featureLabel"
        style={[
          userAdminStyles.avatarText,
          size !== 42 ? { fontSize: Math.round(size * 0.38) } : null,
        ]}
      >
        {initials(name)}
      </ThemedText>
    </View>
  );
}

export function StatusChip({ status }: { status?: UserStatus | null }) {
  const tone =
    status === "ACTIVE"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : status === "BANNED"
          ? "danger"
          : "neutral";

  return <AdminChip label={userStatusLabel(status)} tone={tone} />;
}

export function UserAccountRow({
  user,
  subtitle,
  onPress,
}: {
  user: UserSimpleResponse;
  subtitle?: string;
  onPress: () => void;
}) {
  const person = getPrimaryPerson(user);
  const defaultSubtitle = user.persons.length
    ? user.persons.map((item) => `• ${item.fullName}`).join("\n")
    : "• Chưa liên kết hồ sơ";

  return (
    <AdminListRow
      leading={<Avatar name={person?.fullName ?? user.phoneNumber} />}
      title={user.phoneNumber}
      subtitle={subtitle ?? defaultSubtitle}
      meta={<StatusChip status={user.status} />}
      onPress={onPress}
    />
  );
}

export const userAdminStyles = StyleSheet.create({
  list: { overflow: "hidden", borderRadius: radii.md },
  zeroPadding: { padding: 0, overflow: "hidden" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primarySoft,
  },
  avatarText: { color: Colors.light.primary },
});

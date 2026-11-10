import { ChevronRight, User } from "reicon-react-native";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import {
  Colors,
  activeEffect,
  colorPrimitives,
  effects,
  radii,
  typography,
} from "@/theme";

export function AccountProfileCard({
  displayName,
  profileLabel,
  canSwitchAccount = true,
  onSwitchAccount,
}: {
  displayName: string;
  profileLabel: string;
  canSwitchAccount?: boolean;
  onSwitchAccount: () => void;
}) {
  return (
    <ImageBackground
      source={require("@/assets/images/headline.png")}
      style={styles.profileCard}
      imageStyle={styles.profileCardImage}
    >
      <View style={styles.avatar}>
        <AppIcon icon={<User weight="Filled" />} size={48} color={Colors.light.surface} />
      </View>
      <View style={styles.profileContent}>
        <ThemedText type="title" numberOfLines={2} style={styles.profileName}>
          {displayName}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.profileLabel}>
          {profileLabel}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chuyển tài khoản"
          onPress={onSwitchAccount}
          style={({ pressed }) => [
            styles.switchAccount,
            !canSwitchAccount ? styles.disabled : null,
            activeEffect(pressed, "pressed"),
          ]}
        >
          <ThemedText type="action" style={styles.switchText}>
            Chuyển tài khoản
          </ThemedText>
          <AppIcon icon={<ChevronRight />}
            width={7}
            height={13}
            color={Colors.light.primary}
          />
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    minHeight: 120,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
    overflow: "hidden",
    ...effects.card,
  },
  profileCardImage: {
    borderRadius: radii.md,
    resizeMode: "cover",
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: colorPrimitives.red[300],
    alignItems: "center",
    justifyContent: "center",
  },
  profileContent: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    color: Colors.light.text,
    ...typography.title,
  },
  profileLabel: {
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  switchAccount: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  switchText: {
    color: Colors.light.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});

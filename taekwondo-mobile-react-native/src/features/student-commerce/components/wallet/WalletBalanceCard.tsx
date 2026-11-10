import { ChevronRight, DocText, InfoCircle, User } from "reicon-react-native";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii, typography } from "@/theme";

import type { StudentSummaryView } from "../../types";
import { formatVnd } from "../../utils/studentCommerceUtils";

const cardWalletImage = require("../../../../../assets/images/card_wallet.png");

type WalletBalanceCardProps = {
  student: StudentSummaryView;
  balance: number;
  actionLabel: string;
  onActionPress: () => void;
};

export function WalletBalanceCard({
  student,
  balance,
  actionLabel,
  onActionPress,
}: WalletBalanceCardProps) {
  return (
    <ImageBackground
      source={cardWalletImage}
      resizeMode="cover"
      style={styles.card}
      imageStyle={styles.cardImage}
      accessibilityIgnoresInvertColors
    >
      <View style={styles.cardContent}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <AppIcon icon={<User weight="Filled" />} size={34} color={Colors.light.primary} />
          </View>
          <View style={styles.profileCopy}>
            <ThemedText
              type="heading"
              numberOfLines={2}
              style={styles.studentName}
            >
              {student.fullName} · {student.personCode}
            </ThemedText>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <ThemedText
                type="action"
                numberOfLines={1}
                style={styles.statusText}
              >
                Đang hoạt động
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.balanceBlock}>
          <View style={styles.balanceLabelRow}>
            <ThemedText type="body" style={styles.whiteRegular}>
              Số dư khả dụng
            </ThemedText>
            <AppIcon icon={<InfoCircle />} size={18} color={Colors.light.surface} />
          </View>
          <ThemedText style={styles.balance}>{formatVnd(balance)}</ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <AppIcon icon={<DocText />} size={26} color={Colors.light.primary} />
          <ThemedText type="subtitle" style={styles.actionText}>
            {actionLabel}
          </ThemedText>
          <AppIcon icon={<ChevronRight />}
            width={13}
            height={24}
            color={Colors.light.primary}
          />
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 286,
    overflow: "hidden",
    borderRadius: radii.xl,
    borderCurve: "continuous",
    backgroundColor: Colors.light.primary,
  },
  cardImage: {
    borderRadius: radii.xl,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    gap: 18,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.surface, 0.92),
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  whiteRegular: {
    color: Colors.light.surface,
    ...typography.bodySmall,
  },
  studentName: {
    color: Colors.light.surface,
    ...typography.subtitle,
  },
  statusPill: {
    maxWidth: "100%",
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.surface, 0.18),
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: "#28E978",
  },
  statusText: {
    flexShrink: 1,
    color: Colors.light.surface,
    ...typography.caption,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: hexToRgba(Colors.light.surface, 0.35),
  },
  balanceBlock: {
    gap: 3,
  },
  balanceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balance: {
    color: Colors.light.surface,
    fontFamily: typography.subtitle.fontFamily,
    fontSize: 50,
    lineHeight: 58,
    fontWeight: "800",
  },
  actionButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: "auto",
    paddingHorizontal: 18,
    borderRadius: radii.header,
    backgroundColor: Colors.light.surface,
  },
  actionText: {
    flex: 1,
    color: Colors.light.primary,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.82,
  },
});

import { Minus, Plus } from "reicon-react-native";
import { StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

import type { WalletTransactionView } from "../../types";
import { formatVnd } from "../../utils/studentCommerceUtils";

type WalletTransactionPreviewCardProps = {
  transaction: WalletTransactionView;
};

export function WalletTransactionPreviewCard({
  transaction,
}: WalletTransactionPreviewCardProps) {
  const credit = transaction.direction === "CREDIT";
  const amountColor = credit ? "#059669" : Colors.light.primary;
  const icon = credit ? <Plus /> : <Minus />;

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: credit ? "#E8F8EF" : hexToRgba(Colors.light.primary, 0.08) },
        ]}
      >
        <AppIcon
          icon={icon}
          size={26}
          color={amountColor}
        />
      </View>
      <View style={styles.copy}>
        <ThemedText type="subtitle" numberOfLines={1} style={styles.title}>
          {transaction.title}
        </ThemedText>
        <ThemedText type="bodySmall" numberOfLines={1} style={styles.meta}>
          {transaction.dateLabel}
          {transaction.courseName ? ` · ${transaction.courseName}` : ""}
        </ThemedText>
      </View>
      <ThemedText type="subtitle" numberOfLines={1} style={[styles.amount, { color: amountColor }]}>
        {credit ? "+" : "-"}
        {formatVnd(transaction.amount)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: hexToRgba(Colors.light.divider, 0.64),
    borderRadius: radii.lg,
    backgroundColor: Colors.light.surface,
  },
  iconBox: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.light.text,
  },
  meta: {
    color: Colors.light.textSecondary,
  },
  amount: {
    flexShrink: 0,
    maxWidth: "42%",
    textAlign: "right",
  },
});

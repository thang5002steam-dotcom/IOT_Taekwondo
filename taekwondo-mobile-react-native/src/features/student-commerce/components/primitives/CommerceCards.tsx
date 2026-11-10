import {
  Calendar,
  ChevronRight,
  Layers,
  Location,
  NoteText,
} from "reicon-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { formatVnd } from "@/shared/utils/currency";
import { Colors, effects, hexToRgba, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

import type {
  CourseView,
  WalletTransactionView,
} from "../../types";
import {
  InfoRow,
  StatusBadge,
  SurfaceCard,
} from "@/shared/ui/commerce/CommercePrimitives";

function formatCourseStartingPrice(course: CourseView) {
  if (course.packages.length === 0) return "Chưa có học phí";
  const monthlyAmount = Math.min(
    ...course.packages.map((item) => {
      const durationMatch = item.durationLabel.match(/\d+/);
      const durationMonths = durationMatch ? Math.max(Number(durationMatch[0]), 1) : 1;
      return Math.round(item.amount / durationMonths);
    }),
  );
  return `Từ ${formatVnd(monthlyAmount)}/tháng`;
}

export function CourseIconBox({ size = 40 }: { size?: number }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <AppIcon
        icon={<Layers weight="Filled" />}
        size={Math.min(size - 14, 26)}
        color={Colors.light.primary}
      />
    </View>
  );
}

export function CourseCatalogCard({
  course,
  onPress,
}: {
  course: CourseView;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết ${course.courseName}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard style={styles.courseCatalogCard}>
        <View pointerEvents="none" style={styles.courseArc} />
        <View style={styles.courseHeaderRow}>
          <CourseIconBox size={60} />
          <View style={styles.courseInfo}>
            <ThemedText
              type="subtitle"
              numberOfLines={2}
              style={styles.courseTitle}
            >
              {course.courseName}
            </ThemedText>
            <CourseMetaRow icon={<Location />} label={`Cơ sở ${course.branchName}`} />
            <CourseMetaRow icon={<Calendar />} label={course.scheduleLabel} />
          </View>
          <View style={styles.courseChevron}>
            <AppIcon
              icon={<ChevronRight />}
              width={10}
              height={18}
              color={Colors.light.text}
            />
          </View>
        </View>
        <View style={styles.courseDivider} />
        <View style={styles.coursePriceBlock}>
          <ThemedText type="bodySmall" style={styles.secondaryText}>
            Học phí từ
          </ThemedText>
          <ThemedText type="heading" style={styles.priceText}>
            {formatCourseStartingPrice(course).replace(/^Từ\s*/i, "")}
          </ThemedText>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

function CourseMetaRow({
  icon,
  label,
}: {
  icon: AppIconElement;
  label: string;
}) {
  return (
    <View style={styles.courseMetaRow}>
      <AppIcon icon={icon} size={22} color={Colors.light.textSecondary} />
      <ThemedText
        type="bodySmall"
        numberOfLines={2}
        style={styles.secondaryText}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export function EnrollmentCard({
  enrollment,
  onPress,
}: {
  enrollment: {
    courseName: string;
    branchName: string;
    scheduleLabel: string;
    statusLabel: string;
    usedSessions: number;
    totalSessions: number;
    dateRangeLabel: string;
  };
  onPress?: () => void;
}) {
  const remaining = Math.max(
    enrollment.totalSessions - enrollment.usedSessions,
    0,
  );
  const progress = Math.min(
    enrollment.usedSessions / enrollment.totalSessions,
    1,
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard>
        <View style={styles.row}>
          <CourseIconBox size={36} />
          <View style={styles.flex}>
            <ThemedText type="title" style={styles.blackText}>
              {enrollment.courseName}
            </ThemedText>
            <ThemedText type="bodySmall" style={styles.blackText}>
              {enrollment.branchName} · {enrollment.scheduleLabel}
            </ThemedText>
          </View>
          <StatusBadge label={enrollment.statusLabel} />
        </View>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Còn {remaining}/{enrollment.totalSessions} buổi
        </ThemedText>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressValue, { width: `${progress * 100}%` }]}
          />
        </View>
        <ThemedText type="bodySmall" style={styles.blackText}>
          {enrollment.dateRangeLabel}
        </ThemedText>
      </SurfaceCard>
    </Pressable>
  );
}

export function TransactionCard({
  transaction,
}: {
  transaction: WalletTransactionView;
}) {
  const credit = transaction.direction === "CREDIT";
  return (
    <SurfaceCard soft style={styles.transactionCard}>
      <View style={styles.row}>
        <AppIcon icon={<NoteText />} size={22} color={Colors.light.text} />
        <View style={styles.flex}>
          <ThemedText
            type={transaction.title.length > 12 ? "action" : "bodySmall"}
            style={styles.blackText}
          >
            {transaction.title}
          </ThemedText>
          <ThemedText type="bodySmall" style={styles.blackText}>
            {transaction.dateLabel}
            {transaction.courseName ? ` · ${transaction.courseName}` : ""}
          </ThemedText>
        </View>
        <ThemedText type="bodySmall" style={styles.blackText}>
          {credit ? "+" : "-"}
          {formatVnd(transaction.amount)}
        </ThemedText>
      </View>
    </SurfaceCard>
  );
}

export function BalanceCard({ label, amount }: { label: string; amount: number }) {
  return (
    <SurfaceCard soft>
      <ThemedText type="bodySmall" style={styles.blackText}>
        {label}
      </ThemedText>
      <ThemedText type="heading" style={styles.blackText}>
        {formatVnd(amount)}
      </ThemedText>
    </SurfaceCard>
  );
}

export function PurchaseSummary({
  balance,
  price,
  balanceAfter,
}: {
  balance: number;
  price: number;
  balanceAfter: number;
}) {
  return (
    <SurfaceCard>
      <InfoRow label="Số dư hiện tại" value={formatVnd(balance)} />
      <InfoRow label="Gói học" value={`-${formatVnd(price)}`} />
      <InfoRow label="Số dư sau đăng ký" value={formatVnd(balanceAfter)} />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  courseCatalogCard: {
    minHeight: 168,
    overflow: "hidden",
    borderWidth: 0,
    borderRadius: radii.xl,
    padding: 16,
    ...effects.soft,
  },
  courseArc: {
    position: "absolute",
    right: -106,
    bottom: -122,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  courseHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  courseInfo: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  courseTitle: {
    color: Colors.light.text,
  },
  courseMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  courseChevron: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
  },
  courseDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
    marginTop: 16,
  },
  coursePriceBlock: {
    gap: 3,
    paddingTop: 12,
  },
  progressTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.backgroundElement,
  },
  progressValue: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primary,
  },
  transactionCard: {
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  priceText: {
    color: Colors.light.primary,
  },
});

import { useCallback, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Trash6 } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { FloatingActionBar, type FloatingActionItem } from "@/shared/ui/FloatingActionBar";
import { ThemedText } from "@/shared/ui/ThemedText";
import { formatVnd } from "@/shared/utils/currency";
import { Colors, radii, Spacing } from "@/theme";
import type { CoursePriceItemView } from "../domain/course-price.types";

export type CoursePriceDetailWindowProps = {
  coursePrice?: CoursePriceItemView | null;
  onClose: () => void;
  onEdit?: (coursePrice: CoursePriceItemView) => void;
  onToggleStatus?: (coursePrice: CoursePriceItemView) => void;
  onDelete?: (coursePrice: CoursePriceItemView) => Promise<boolean>;
  onCancelDelete?: () => void;
  deleting?: boolean;
  actionPending?: boolean;
};

export function CoursePriceDetailWindow({
  coursePrice,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  onCancelDelete,
  deleting = false,
  actionPending = false,
}: CoursePriceDetailWindowProps) {
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);

  const isActive = coursePrice?.status === "ACTIVE";

  const handleClose = useCallback(() => {
    setDeleteConfirmationVisible(false);
    onClose();
  }, [onClose]);

  const handleConfirmDelete = useCallback(async () => {
    if (!onDelete || !coursePrice) return;
    setDeleteConfirmationVisible(false);
    const success = await onDelete(coursePrice);
    if (success) {
      handleClose();
    }
  }, [coursePrice, handleClose, onDelete]);

  const footerActions: FloatingActionItem[] = [];

  if (onEdit && coursePrice) {
    footerActions.push({
      label: "Chỉnh sửa",
      accessibilityLabel: "Chỉnh sửa gói học",
      variant: "outline",
      disabled: actionPending || deleting,
      loading: actionPending,
      onPress: () => {
        const target = coursePrice;
        onClose();
        onEdit(target);
      },
    });
  }

  if (onToggleStatus && coursePrice) {
    footerActions.push({
      label: isActive ? "Tạm dừng" : "Kích hoạt",
      accessibilityLabel: isActive ? "Tạm dừng gói học" : "Kích hoạt gói học",
      variant: "primary",
      disabled: actionPending || deleting,
      loading: actionPending,
      onPress: () => onToggleStatus(coursePrice),
      flex: 1.2,
    });
  }

  if (onDelete && coursePrice) {
    footerActions.push({
      label: "",
      accessibilityLabel: "Xóa gói học",
      variant: "ghost",
      disabled: actionPending || deleting,
      loading: deleting,
      onPress: () => setDeleteConfirmationVisible(true),
      flex: 0,
      style: styles.deleteButton,
      icon: (
        <AppIcon
          icon={<Trash6 />}
          size={30}
          color={actionPending || deleting ? Colors.light.textSecondary : Colors.light.error}
        />
      ),
    });
  }

  return (
    <BottomSheetWindow
      visible={Boolean(coursePrice)}
      title="Chi tiết gói học"
      accessibilityLabel="Cửa sổ chi tiết gói học"
      heightRatio={0.65}
      contentPaddingHorizontal={false}
      onClose={handleClose}
      overlay={
        coursePrice ? (
          <>
            <ConfirmationDialog
              visible={deleteConfirmationVisible}
              presentation="inline"
              title="Xóa gói học"
              description={`Bạn có chắc chắn muốn xóa gói học ${coursePrice.durationLabel} (${coursePrice.sessionsLabel}) không? Thao tác này không thể hoàn tác.`}
              confirmLabel="Xóa"
              cancelLabel="Hủy"
              confirmVariant="danger"
              onCancel={() => setDeleteConfirmationVisible(false)}
              onConfirm={() => void handleConfirmDelete()}
            />
            <CancellableLoadingOverlay
              visible={deleting}
              message="Đang xóa gói học..."
              cancelLabel="Hủy"
              onCancel={onCancelDelete}
            />
          </>
        ) : undefined
      }
      footer={
        footerActions.length > 0 && coursePrice ? (
          <FloatingActionBar
            placement="sheet"
            actions={footerActions}
          />
        ) : undefined
      }
    >
      {coursePrice ? (
        <View style={styles.content}>
          <DetailRow label="Thời hạn">
            <ValueText>{coursePrice.durationLabel}</ValueText>
          </DetailRow>

          <DetailRow label="Số buổi học">
            <ValueText>{coursePrice.sessionsLabel}</ValueText>
          </DetailRow>

          {coursePrice.basePrice !== undefined && coursePrice.basePrice > 0 && (
            <DetailRow label="Học phí gốc">
              <ValueText>{formatVnd(coursePrice.basePrice)}</ValueText>
            </DetailRow>
          )}

          <DetailRow label="Học phí ưu đãi">
            <ThemedText type="bodySmall" style={styles.primaryValue} selectable>
              {formatVnd(coursePrice.finalPrice)}
            </ThemedText>
          </DetailRow>

          <DetailRow label="Ước tính / tháng">
            <ValueText>~{formatVnd(coursePrice.monthlyPrice)} / tháng</ValueText>
          </DetailRow>

          <DetailRow label="Trạng thái" last>
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
              ]}
            >
              <ThemedText
                type="caption"
                style={[
                  styles.statusText,
                  isActive ? styles.statusTextActive : styles.statusTextInactive,
                ]}
              >
                {coursePrice.statusLabel}
              </ThemedText>
            </View>
          </DetailRow>
        </View>
      ) : null}
    </BottomSheetWindow>
  );
}

function ValueText({ children }: { children: ReactNode }) {
  return (
    <ThemedText type="bodySmall" style={styles.value} selectable>
      {children}
    </ThemedText>
  );
}

function DetailRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last ? styles.lastRow : null]}>
      <ThemedText type="bodySmall" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.valueWrapper}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.four,
  },
  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    width: 130,
    color: Colors.light.textSecondary,
  },
  valueWrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  value: {
    color: Colors.light.text,
    fontWeight: "600",
    textAlign: "right",
  },
  primaryValue: {
    color: Colors.light.primary,
    fontWeight: "700",
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusBadgeActive: {
    backgroundColor: Colors.light.successSoft,
  },
  statusBadgeInactive: {
    backgroundColor: Colors.light.backgroundElement,
  },
  statusText: {
    fontWeight: "700",
  },
  statusTextActive: {
    color: Colors.light.success,
  },
  statusTextInactive: {
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    width: 44,
    minWidth: 44,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
});

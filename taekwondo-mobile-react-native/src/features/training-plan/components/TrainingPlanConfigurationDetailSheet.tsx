import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Trash6 } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, radii } from "@/theme";
import type {
  TrainingPlanAddonSimpleResponse,
  TrainingPlanRequirementSimpleResponse,
} from "../api/trainingPlan.dto";

export type ConfigurationSelection =
  | { kind: "requirement"; item: TrainingPlanRequirementSimpleResponse }
  | { kind: "addon"; item: TrainingPlanAddonSimpleResponse };

export function TrainingPlanConfigurationDetailSheet({
  selection,
  onClose,
  onEdit,
  onDelete,
  overlay,
}: {
  selection?: ConfigurationSelection;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  overlay?: ReactNode;
}) {
  const isRequirement = selection?.kind === "requirement";
  return (
    <BottomSheetWindow
      visible={Boolean(selection)}
      title={isRequirement ? "Chi tiết yêu cầu" : "Chi tiết add-on"}
      heightRatio={0.5}
      onClose={onClose}
      overlay={overlay}
      footer={
        selection ? (
          <FloatingActionBar
            placement="sheet"
            actions={[
              {
                label: "Chỉnh sửa",
                variant: "outline",
                accessibilityLabel: "Chỉnh sửa",
                onPress: onEdit,
              },
              {
                label: "",
                variant: "outline",
                accessibilityLabel: "Xóa",
                onPress: onDelete,
                flex: 0,
                style: styles.delete,
                icon: (
                  <AppIcon
                    icon={<Trash6 />}
                    size={30}
                    color={Colors.light.error}
                  />
                ),
              },
            ]}
          />
        ) : undefined
      }
    >
      {selection ? (
        <View style={styles.content}>
          {isRequirement ? (
            <>
              <Row
                label="Loại yêu cầu"
                value={label(selection.item.sessionType)}
              />
              <Row
                label="Số buổi/tuần"
                value={`${selection.item.sessionsPerWeek}`}
                last
              />
            </>
          ) : (
            <>
              <Row label="Tên add-on" value={selection.item.name} />
              <Row
                label="Buổi tăng thêm/tuần"
                value={`${selection.item.extraSessionsPerWeek}`}
              />
              <Row label="Giá bán" value={formatMoney(selection.item.price)} />
              <Row
                label="Trạng thái"
                value={
                  selection.item.status === "ACTIVE" ? "Đang bán" : "Tạm dừng"
                }
                last
              />
            </>
          )}
        </View>
      ) : null}
    </BottomSheetWindow>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last ? styles.last : null]}>
      <ThemedText type="bodySmall" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type="bodySmall" style={styles.value}>
        {value}
      </ThemedText>
    </View>
  );
}
function label(value: string) {
  return (
    { REQUIRED: "Buổi bắt buộc", STANDARD: "Buổi tiêu chuẩn" }[value] ?? value
  );
}
function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}
const styles = StyleSheet.create({
  content: {},
  row: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
  },
  last: { borderBottomWidth: 0 },
  label: { color: Colors.light.textSecondary },
  value: {
    flex: 1,
    color: Colors.light.text,
    textAlign: "right",
    fontWeight: "600",
  },
  delete: {
    width: 44,
    minWidth: 44,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: radii.pill,
  },
});

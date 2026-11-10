import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";

export interface ClassSessionActionButtonsProps {
  onHistoryPress: () => void;
  onEvaluatePress: () => void;
  historyDisabled?: boolean;
  evaluateDisabled?: boolean;
}

export function ClassSessionActionButtons({
  onHistoryPress,
  onEvaluatePress,
  historyDisabled = false,
  evaluateDisabled = false,
}: ClassSessionActionButtonsProps) {
  return (
    <FloatingActionBar
      actions={[
        {
          label: "Lịch sử",
          accessibilityLabel: "Lịch sử điểm danh",
          variant: "outline",
          disabled: historyDisabled,
          onPress: onHistoryPress,
        },
        {
          label: "Đánh giá",
          accessibilityLabel: "Đánh giá buổi tập",
          variant: "primary",
          disabled: evaluateDisabled,
          onPress: onEvaluatePress,
        },
      ]}
    />
  );
}

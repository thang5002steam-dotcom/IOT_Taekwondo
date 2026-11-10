import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";

export function PackageRegisterButton({
  title = "Đăng ký",
  accessibilityLabel = "Đăng ký gói học",
  disabled = false,
  onPress,
}: {
  title?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <FloatingActionBar
      actions={[
        {
          label: title,
          accessibilityLabel,
          variant: "primary",
          disabled,
          onPress,
        },
      ]}
    />
  );
}

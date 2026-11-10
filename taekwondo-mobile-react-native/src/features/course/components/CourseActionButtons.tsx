import { Trash6 } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";
import { Colors } from "@/theme";

export interface CourseActionButtonsProps {
  editTitle?: string;
  editAccessibilityLabel?: string;
  editDisabled?: boolean;
  onEditPress?: () => void;
  packageTitle?: string;
  packageAccessibilityLabel?: string;
  packageDisabled?: boolean;
  onPackagePress?: () => void;
  /** @deprecated use packageTitle */
  registerTitle?: string;
  /** @deprecated use packageAccessibilityLabel */
  registerAccessibilityLabel?: string;
  /** @deprecated use packageDisabled */
  registerDisabled?: boolean;
  /** @deprecated use onPackagePress */
  onRegisterPress?: () => void;
  deleteAccessibilityLabel?: string;
  deleteDisabled?: boolean;
  onDeletePress?: () => void;
}

export function CourseActionButtons({
  editTitle = "Chỉnh sửa",
  editAccessibilityLabel = "Chỉnh sửa khóa học",
  editDisabled = false,
  onEditPress,
  packageTitle,
  packageAccessibilityLabel,
  packageDisabled,
  onPackagePress,
  registerTitle,
  registerAccessibilityLabel,
  registerDisabled,
  onRegisterPress,
  deleteAccessibilityLabel = "Xóa khóa học",
  deleteDisabled = false,
  onDeletePress,
}: CourseActionButtonsProps) {
  const finalPackageTitle = packageTitle ?? registerTitle ?? "Gói học";
  const finalPackageAccessibilityLabel =
    packageAccessibilityLabel ?? registerAccessibilityLabel ?? "Xem gói học";
  const finalPackageDisabled = packageDisabled ?? registerDisabled ?? false;
  const handlePackagePress = onPackagePress ?? onRegisterPress;

  return (
    <FloatingActionBar
      actions={[
        {
          label: editTitle,
          accessibilityLabel: editAccessibilityLabel,
          variant: "outline",
          disabled: editDisabled,
          onPress: onEditPress,
          flex: 1,
        },
        {
          label: finalPackageTitle,
          accessibilityLabel: finalPackageAccessibilityLabel,
          variant: "primary",
          disabled: finalPackageDisabled,
          onPress: handlePackagePress,
          flex: 1.3,
        },
        ...(onDeletePress
          ? [
              {
                label: "",
                accessibilityLabel: deleteAccessibilityLabel,
                variant: "ghost" as const,
                disabled: deleteDisabled,
                onPress: onDeletePress,
                flex: 0,
                style: {
                  width: 44,
                  minWidth: 44,
                  paddingHorizontal: 0,
                  backgroundColor: "transparent",
                  borderWidth: 0,
                },
                icon: (
                  <AppIcon
                    icon={<Trash6 />}
                    size={30}
                    color={
                      deleteDisabled
                        ? Colors.light.textSecondary
                        : Colors.light.error
                    }
                  />
                ),
              },
            ]
          : []),
      ]}
    />
  );
}

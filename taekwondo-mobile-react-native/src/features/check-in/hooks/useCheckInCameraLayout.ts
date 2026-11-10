import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useCheckInCameraLayout() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return useMemo(() => {
    const headerHeight = insets.top + 72;
    const bottomClearance = Math.max(insets.bottom, 10) + 112;
    const scanAreaHeight = Math.max(
      height - headerHeight - bottomClearance,
      260,
    );
    const controlsHeight = 112;
    const controlsTop = Math.max(
      headerHeight + 12,
      headerHeight + scanAreaHeight / 2 - controlsHeight / 2,
    );

    return {
      topInset: insets.top,
      headerHeight,
      bottomClearance,
      scanAreaHeight,
      controlsTop,
    };
  }, [height, insets.bottom, insets.top]);
}

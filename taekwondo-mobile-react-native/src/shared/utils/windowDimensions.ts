import { Dimensions } from "react-native";

export function getWindowDimensions() {
  const { width, height } = Dimensions.get("window");

  return { width, height };
}

export const WINDOW_DIMENSIONS = getWindowDimensions();
export const WINDOW_WIDTH = WINDOW_DIMENSIONS.width;
export const WINDOW_HEIGHT = WINDOW_DIMENSIONS.height;

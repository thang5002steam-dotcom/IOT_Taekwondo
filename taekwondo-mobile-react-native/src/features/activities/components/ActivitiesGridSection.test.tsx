import { render } from "@testing-library/react-native";
import { View } from "react-native";

import type { ActivitiesAction } from "@/features/activities/domain/activities.types";

import { ActivitiesGridSection } from "./ActivitiesGridSection";

const action: ActivitiesAction = {
  id: "history",
  label: "Lich su",
  icon: <View />,
};

describe("ActivitiesGridSection", () => {
  it("renders Figma mask decoration for quick actions", async () => {
    const screen = await render(
      <ActivitiesGridSection actions={[action]} variant="quick" />,
    );

    expect(screen.getByTestId("activities-quick-mask-primary")).toBeTruthy();
    expect(screen.getByTestId("activities-quick-mask-secondary")).toBeTruthy();
  });

  it("does not render quick mask decoration for default actions", async () => {
    const screen = await render(<ActivitiesGridSection actions={[action]} />);

    expect(screen.queryByTestId("activities-quick-mask-primary")).toBeNull();
    expect(screen.queryByTestId("activities-quick-mask-secondary")).toBeNull();
  });
});

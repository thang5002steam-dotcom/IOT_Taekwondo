import { CheckListNotes, DocText, NoteText } from "reicon-react-native";
import { render } from "@testing-library/react-native";
import { StyleSheet, type ViewStyle } from "react-native";

import { NavigationMenu, NavigationMenuItem } from "./NavigationMenu";

function flattenRenderedStyle(style: ViewStyle | ViewStyle[] | ((state: { pressed: boolean }) => ViewStyle | ViewStyle[])) {
  return StyleSheet.flatten(
    typeof style === "function" ? style({ pressed: false }) : style,
  );
}

describe("NavigationMenu", () => {
  it("renders one-line items with count and default divider", async () => {
    const screen = await render(
      <NavigationMenu>
        <NavigationMenuItem icon={<DocText />} title="Khóa học đang học" count={2} />
        <NavigationMenuItem icon={<CheckListNotes />} title="Lịch sử tập luyện" />
      </NavigationMenu>,
    );

    const firstRow = screen.getByLabelText("Khóa học đang học");
    const firstRowStyle = flattenRenderedStyle(firstRow.props.style);

    expect(screen.getByText("Khóa học đang học (2)")).toBeTruthy();
    expect(screen.getByText("Lịch sử tập luyện")).toBeTruthy();
    expect(firstRowStyle.minHeight).toBe(60);
    expect(firstRowStyle.paddingVertical).toBe(8);
  });

  it("gives subtitle rows extra height and breathing room", async () => {
    const screen = await render(
      <NavigationMenu>
        <NavigationMenuItem
          icon={<NoteText />}
          iconBox
          title="Giao dịch gần đây"
          subtitle="Xem lịch sử thu chi của ví"
        />
      </NavigationMenu>,
    );

    const row = screen.getByLabelText("Giao dịch gần đây");
    const rowStyle = flattenRenderedStyle(row.props.style);

    expect(screen.getByText("Xem lịch sử thu chi của ví")).toBeTruthy();
    expect(rowStyle.minHeight).toBe(76);
    expect(rowStyle.paddingVertical).toBe(10);
  });

  it("preserves disabled accessibility state", async () => {
    const screen = await render(
      <NavigationMenu
        items={[
          {
            title: "Giao dịch gần đây",
            subtitle: "Xem lịch sử thu chi của ví",
            disabled: true,
          },
        ]}
      />,
    );

    expect(screen.getByLabelText("Giao dịch gần đây").props.accessibilityState).toEqual({
      disabled: true,
    });
  });
});

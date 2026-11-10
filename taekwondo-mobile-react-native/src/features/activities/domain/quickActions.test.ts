import type { ActivitiesActionGroup } from "./activities.types";
import {
  addQuickActionId,
  getAvailableCatalogGroups,
  getQuickActions,
  getValidQuickActionIds,
  MAX_QUICK_FEATURES,
  removeQuickActionId,
} from "./quickActions";

const actions = [
  { id: "history", label: "Lich su", icon: null as never, defaultQuick: true },
  { id: "ranking", label: "Bang xep hang", icon: null as never },
  { id: "students", label: "Hoc vien", icon: null as never },
  { id: "courses", label: "Khoa hoc", icon: null as never },
  { id: "coaches", label: "HLV", icon: null as never },
];

const groups: ActivitiesActionGroup[] = [
  { title: "Tinh nang", actions: actions.slice(0, 3) },
  { title: "Tien ich", actions: actions.slice(3) },
];

describe("quickActions", () => {
  it("returns quick actions in stored id order and skips invalid ids", () => {
    expect(getQuickActions(["students", "missing", "history"], actions)).toEqual(
      [actions[2], actions[0]],
    );
  });

  it("filters catalog actions that are already quick actions", () => {
    expect(getAvailableCatalogGroups(groups, ["history", "courses"])).toEqual([
      { title: "Tinh nang", actions: [actions[1], actions[2]] },
      { title: "Tien ich", actions: [actions[4]] },
    ]);
  });

  it("makes a removed quick action available in the catalog again", () => {
    const quickIds = removeQuickActionId(["history", "ranking"], "history");

    expect(quickIds).toEqual(["ranking"]);
    expect(getAvailableCatalogGroups(groups, quickIds)[0].actions).toContain(
      actions[0],
    );
  });

  it("does not add duplicate quick ids", () => {
    const quickIds = ["history", "ranking"];

    expect(addQuickActionId(quickIds, "history")).toBe(quickIds);
  });

  it("does not add more than the quick action limit", () => {
    const quickIds = actions.slice(0, MAX_QUICK_FEATURES).map((action) => action.id);

    expect(addQuickActionId(quickIds, "coaches")).toBe(quickIds);
  });

  it("keeps only valid unique quick ids up to the quick action limit", () => {
    expect(
      getValidQuickActionIds(
        ["history", "missing", "history", "ranking", "students", "courses", "coaches"],
        actions,
      ),
    ).toEqual(["history", "ranking", "students", "courses"]);
  });
});

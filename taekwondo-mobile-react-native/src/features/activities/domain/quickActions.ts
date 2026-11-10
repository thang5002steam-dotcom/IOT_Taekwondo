import type { ActivitiesAction, ActivitiesActionGroup } from "./activities.types";

export const MAX_QUICK_FEATURES = 4;

export function getDefaultQuickActionIds(
  actions: ActivitiesAction[],
): string[] {
  return actions
    .filter((action) => action.defaultQuick)
    .slice(0, MAX_QUICK_FEATURES)
    .map((action) => action.id);
}

export function getQuickActions(
  quickActionIds: string[],
  actions: ActivitiesAction[],
): ActivitiesAction[] {
  const actionsById = new Map(actions.map((action) => [action.id, action]));

  return quickActionIds
    .map((id) => actionsById.get(id))
    .filter((action): action is ActivitiesAction => Boolean(action));
}

export function getValidQuickActionIds(
  quickActionIds: string[],
  actions: ActivitiesAction[],
): string[] {
  const actionIds = new Set(actions.map((action) => action.id));

  return quickActionIds
    .filter((id, index, ids) => actionIds.has(id) && ids.indexOf(id) === index)
    .slice(0, MAX_QUICK_FEATURES);
}

export function getAvailableCatalogGroups(
  groups: ActivitiesActionGroup[],
  quickActionIds: string[],
): ActivitiesActionGroup[] {
  const quickActionIdSet = new Set(quickActionIds);

  return groups
    .map((group) => ({
      ...group,
      actions: group.actions.filter(
        (action) => !quickActionIdSet.has(action.id),
      ),
    }))
    .filter((group) => group.actions.length > 0);
}

export function addQuickActionId(
  quickActionIds: string[],
  actionId: string,
): string[] {
  if (
    quickActionIds.includes(actionId) ||
    quickActionIds.length >= MAX_QUICK_FEATURES
  ) {
    return quickActionIds;
  }

  return [...quickActionIds, actionId];
}

export function removeQuickActionId(
  quickActionIds: string[],
  actionId: string,
): string[] {
  return quickActionIds.filter((id) => id !== actionId);
}

# Stack virtualized-list rules

Use this pattern for a pushed screen that has a searchable or paginated list
and therefore needs `FlatList` or another virtualized list as its scroll
owner.

## Ownership

- Render the screen inside `StackScreenLayout` with `scrollEnabled={false}`.
- The virtualized list is the only vertical scroll owner. Do not nest it in a
  `ScrollView` or wrap it in another scrolling container.
- Make the list the direct flex child of the layout content. `StackScreenLayout`
  continues to own stack header, safe-area treatment and the 20px horizontal
  content inset.

## List composition

- Put the intro, search/filter controls and section heading in
  `ListHeaderComponent` so they scroll with the results. Keep a control fixed
  only when the product explicitly calls for a sticky action.
- Use `contentContainerStyle` with `paddingTop: 20`, `paddingBottom: 28–32`,
  a 14px header rhythm and a 12px item gap.
- Use `showsVerticalScrollIndicator={false}`. Do not use
  `contentInsetAdjustmentBehavior="automatic"` inside this shell.
- The list owns pull-to-refresh, pagination, keyboard dismissal and list
  footer behavior.

## States and behavior

- Keep the list mounted for initial loading, errors and empty results so the
  search and contextual header remain available.
- Distinguish initial loading, request error with retry, empty data, empty
  filtered results and loading the next page.
- Keep data queries, permissions, route navigation and mutation behavior in
  the feature screen or its hooks; visual list primitives only receive display
  state and callbacks.
- Preserve accessible labels, pressed/disabled states and practical touch
  targets for search-adjacent actions.

## References

- `src/features/notification/screens/NotificationScreen.tsx` is the canonical
  stack + `FlatList` composition.
- `src/features/user/screens/UserListScreen.tsx` defines the administration
  rhythm and primitives to reuse when the list belongs to that visual family.

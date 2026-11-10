# Bottom-sheet content rules

`BottomSheetWindow` is the only shared app sheet shell. Compose feature-specific content inside it; do not create another `Modal` sheet for a picker, detail view or short form.

## Ownership

- `BottomSheetWindow` owns modal semantics, backdrop, header, handle, close action, drag dismissal, bounded height, scrolling and the optional fixed footer.
- The caller owns only its feature content, including hierarchy, empty/loading/error states and internal content inset.
- Do not change the shared shell's default padding to solve one sheet's layout. Existing callers may already own their own alignment.

## Content inset and scrolling

- A scrollable sheet passes its feature inset through `contentContainerStyle`; do not pad the `ScrollView` itself.
- Use 20px horizontal content inset, 16px top inset and at least 20–24px bottom inset. When the sheet has a footer, allow the shell's footer clearance to remain intact.
- Keep one scroll owner: `BottomSheetWindow` scrolls normal sheet content. Do not nest another scroll container unless the content requires a virtualized, independently sized list.
- Avoid negative margins and edge-to-edge feature rows. Grouped rows should align with the feature content inset, not the physical sheet edge.

## Layout variants

| Variant | Use for | Structure |
| --- | --- | --- |
| Detail | Read-only contextual information | Ordered label/value rows with hairline dividers. |
| Selector/list | Short choices, search results or filters | Search/label followed by one grouped surface; rows have a 48px minimum touch target. |
| Multi-step form | Contextual creation/editing | Step label, grouped choice/form sections and fixed actions through `footer`. |

For selectable people or compact records, use a grouped surface with continuous corners, divider hairlines and rows at least 60px tall when an avatar plus two text lines are present. Keep related form fields separated by the existing 8–12px rhythm.

## Interaction and accessibility

- Use the sheet `footer` for persistent submit/back actions; feature content must not implement a second sticky footer.
- Preserve `keyboardShouldPersistTaps="handled"`; ensure search, long names, large text and error recovery remain reachable with the keyboard open.
- Interactive rows expose role and selected/disabled state. Supply visible text for selection, loading, empty and error states; do not rely only on color.
- Test loading, request failure, empty/filtered empty, long text and a completed action before considering a sheet finished.

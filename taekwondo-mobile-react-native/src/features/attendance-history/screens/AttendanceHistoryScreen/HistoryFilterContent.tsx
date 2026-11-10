import {
  FilterSheetActions,
  MultiSelectFilterContent,
  toggleMultiSelectFilterValue,
} from "@/shared/ui/MultiSelectFilterContent";

import type { HistoryFilterState, HistoryMultiFilterGroup } from "./historyFilter.types";

export function HistoryFilterContent({
  value,
  multiGroups,
  error,
  onChange,
}: {
  value: HistoryFilterState;
  multiGroups: readonly HistoryMultiFilterGroup[];
  error?: string | null;
  onChange: (next: HistoryFilterState) => void;
}) {
  return (
    <MultiSelectFilterContent
      error={error}
      groups={multiGroups.map((group) => ({
        key: group.key,
        title: group.title,
        options: group.options,
        selectedValues: value[group.key] as (string | number)[],
        onToggle: (optionValue) => {
          const selectedValues = value[group.key] as (string | number)[];
          onChange({
            ...value,
            [group.key]: toggleMultiSelectFilterValue(selectedValues, optionValue),
          });
        },
        onSelectAll: () =>
          onChange({
            ...value,
            [group.key]: group.options.map((option) => option.value),
          }),
        onClear: () => onChange({ ...value, [group.key]: [] }),
      }))}
    />
  );
}

export function HistoryFilterActions({
  canApply,
  onReset,
  onApply,
}: {
  canApply: boolean;
  onReset: () => void;
  onApply: () => void;
}) {
  return <FilterSheetActions canApply={canApply} onReset={onReset} onApply={onApply} />;
}

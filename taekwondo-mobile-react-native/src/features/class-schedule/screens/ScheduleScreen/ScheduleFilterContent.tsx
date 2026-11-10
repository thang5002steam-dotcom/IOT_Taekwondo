import {
  FilterSheetActions,
  MultiSelectFilterContent,
} from "@/shared/ui/MultiSelectFilterContent";

import { scheduleFilterGroups } from "./scheduleScreen.fixtures";
import { toggleScheduleFilterValue } from "./scheduleScreen.logic";
import type { ScheduleFilterState } from "./scheduleScreen.types";

export function ScheduleFilterContent({
  value,
  onChange,
}: {
  value: ScheduleFilterState;
  onChange: (next: ScheduleFilterState) => void;
}) {
  return (
    <MultiSelectFilterContent
      groups={scheduleFilterGroups.map((group) => ({
        key: group.key,
        title: group.title,
        options: group.options,
        selectedValues: value[group.key] as (string | number)[],
        onToggle: (optionValue) => {
          onChange({
            ...value,
            [group.key]: toggleScheduleFilterValue(
              value[group.key] as (string | number)[],
              optionValue,
            ),
          } as ScheduleFilterState);
        },
        onSelectAll: () =>
          onChange({
            ...value,
            [group.key]: group.options.map((option) => option.value),
          } as ScheduleFilterState),
        onClear: () => onChange({ ...value, [group.key]: [] } as ScheduleFilterState),
      }))}
    />
  );
}

export function FilterActions({
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

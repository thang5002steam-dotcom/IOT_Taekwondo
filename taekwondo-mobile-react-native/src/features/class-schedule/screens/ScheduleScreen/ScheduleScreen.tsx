import { Tuning } from "reicon-react-native";
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DefaultHeaderActions } from '@/routes/navigation/components/DefaultHeaderActions';
import { HeaderActionButton } from '@/routes/navigation/components/HeaderActionButton';
import BottomTabScreenLayout from '@/routes/navigation/layouts/BottomTabScreenLayout';
import { BottomSheetWindow } from '@/shared/ui/BottomSheetWindow';
import { ScheduleDetailSheet } from '../../components/ScheduleDetailSheet';
import { Colors } from '@/theme';
import { WeekdayLabel, type Weekday } from '../../constants/class-schedule.constants';
import { ScheduleCard } from './ScheduleCard';
import { FilterActions, ScheduleFilterContent } from './ScheduleFilterContent';
import { ScheduleWeekTabBar } from './ScheduleWeekTabBar';
import { scheduleItems } from './scheduleScreen.fixtures';
import {
  countSelectedScheduleFilters,
  emptyScheduleFilters,
  filterScheduleItems,
} from './scheduleScreen.logic';
import type { ScheduleFilterState, ScheduleScreenItem } from './scheduleScreen.types';

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState<Weekday>('MONDAY');
  const [filters, setFilters] = useState<ScheduleFilterState>(emptyScheduleFilters);
  const [draftFilters, setDraftFilters] =
    useState<ScheduleFilterState>(emptyScheduleFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleScreenItem>();

  const appliedCount = countSelectedScheduleFilters(filters);
  const draftCount = countSelectedScheduleFilters(draftFilters);

  const visibleSchedules = useMemo(
    () => filterScheduleItems(scheduleItems, selectedDay, filters),
    [filters, selectedDay],
  );

  return (
    <>
      <BottomTabScreenLayout
        title="Lịch học"
        activeTab="schedule"
        rightActions={
          <>
            <HeaderActionButton
              icon={<Tuning />}
              label="Lọc lịch học"
              badge={appliedCount || undefined}
              color={Colors.light.surface}
              onPress={() => {
                setDraftFilters(filters);
                setFilterVisible(true);
              }}
            />
            <DefaultHeaderActions color={Colors.light.surface} />
          </>
        }
        contentContainerStyle={styles.layoutContent}
      >
        <ScheduleWeekTabBar
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        <View style={styles.list}>
          {visibleSchedules.map((item) => (
            <ScheduleCard key={item.scheduleId} schedule={item} onPress={() => setSelectedSchedule(item)} />
          ))}
        </View>
      </BottomTabScreenLayout>

      <BottomSheetWindow
        visible={filterVisible}
        title="Lọc"
        accessibilityLabel="Lọc lịch học"
        backdropAccessibilityLabel="Đóng lọc lịch học"
        onClose={() => setFilterVisible(false)}
        footer={
          <FilterActions
            canApply={draftCount > 0}
            onReset={() => setDraftFilters(emptyScheduleFilters)}
            onApply={() => {
              setFilters(draftFilters);
              setFilterVisible(false);
            }}
          />
        }
      >
        <ScheduleFilterContent
          value={draftFilters}
          onChange={setDraftFilters}
        />
      </BottomSheetWindow>
      <ScheduleDetailSheet
        visible={Boolean(selectedSchedule)}
        schedule={selectedSchedule ? {
          id: selectedSchedule.scheduleId,
          weekdayLabel: WeekdayLabel[selectedSchedule.weekday] ?? selectedSchedule.weekday,
          timeLabel: `${selectedSchedule.startTime} - ${selectedSchedule.endTime}`,
          branchName: selectedSchedule.branchName,
          primaryCoachName: selectedSchedule.coachName,
        } : undefined}
        onClose={() => setSelectedSchedule(undefined)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  layoutContent: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 25,
    gap: 20,
  },
});

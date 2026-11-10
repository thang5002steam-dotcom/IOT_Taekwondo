import {
  countSelectedScheduleFilters,
  emptyScheduleFilters,
  filterScheduleItems,
} from './scheduleScreen.logic';
import { scheduleItems } from './scheduleScreen.fixtures';

describe('schedule screen filtering', () => {
  it('shows five default Monday schedules', () => {
    expect(filterScheduleItems(scheduleItems, 'MONDAY', emptyScheduleFilters)).toHaveLength(5);
  });

  it('shows one Thursday schedule', () => {
    expect(filterScheduleItems(scheduleItems, 'THURSDAY', emptyScheduleFilters)).toHaveLength(1);
  });

  it('narrows schedules by branch filter', () => {
    expect(
      filterScheduleItems(scheduleItems, 'MONDAY', {
        ...emptyScheduleFilters,
        branchIds: [1],
      }),
    ).toHaveLength(1);
  });

  it('counts reset filters as empty', () => {
    expect(countSelectedScheduleFilters(emptyScheduleFilters)).toBe(0);
  });
});

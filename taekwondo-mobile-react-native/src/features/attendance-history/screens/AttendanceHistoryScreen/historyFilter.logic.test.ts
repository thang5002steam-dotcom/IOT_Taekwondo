import type { HistoryRecordViewModel } from '../../domain/historyMappers';
import {
  canApplyHistoryFilters,
  countSelectedHistoryFilters,
  filterHistoryRecords,
  getHistoryFilterGroups,
  groupHistoryRecordsByDate,
} from './historyFilter.logic';

const records: HistoryRecordViewModel[] = [
  {
    id: 'record-1',
    mode: 'student',
    dateLabel: '09-08-2026',
    branchLabel: 'Cơ sở 2',
    shiftLabel: 'Ca 1',
    statusLabel: 'Có mặt',
    badgeLabel: 'Tốt',
    noteTitle: 'Ghi chú',
    note: 'Đúng giờ',
    tone: 'success',
  },
  {
    id: 'record-2',
    mode: 'student',
    dateLabel: '09-08-2026',
    branchLabel: 'Cơ sở 3',
    shiftLabel: 'Ca 2',
    statusLabel: 'Vắng',
    badgeLabel: 'Trung bình',
    noteTitle: 'Ghi chú',
    note: 'Không có',
    tone: 'warning',
  },
  {
    id: 'record-3',
    mode: 'student',
    dateLabel: '15-04-2026',
    branchLabel: 'Cơ sở 2',
    shiftLabel: 'Ca 1',
    statusLabel: 'Có mặt',
    badgeLabel: 'Tốt',
    noteTitle: 'Ghi chú',
    note: 'Đúng giờ',
    tone: 'success',
  },
];

describe('historyFilter.logic', () => {
  it('counts selected filters and requires year plus quarter to apply', () => {
    const filters = {
      branchIds: [2],
      shifts: ['Ca 1'],
      weekdays: ['MONDAY' as const],
      scheduleLevels: ['BASIC' as const],
      locations: ['INDOOR' as const],
      year: 2026,
      quarter: 3 as const,
    };

    expect(countSelectedHistoryFilters(filters)).toBe(7);
    expect(canApplyHistoryFilters(filters)).toBe(true);
    expect(
      canApplyHistoryFilters({
        branchIds: [],
        shifts: [],
        weekdays: [],
        scheduleLevels: [],
        locations: [],
        quarter: 3,
      }),
    ).toBe(false);
  });

  it('filters records by branch, shift, weekday, and quarter date range', () => {
    const filtered = filterHistoryRecords(records, {
      branchIds: [2],
      shifts: ['Ca 1'],
      weekdays: ['SUNDAY'],
      scheduleLevels: [],
      locations: [],
      year: 2026,
      quarter: 3,
    });

    expect(filtered.map((record) => record.id)).toEqual(['record-1']);
  });

  it('builds unique filter groups from records', () => {
    const groups = getHistoryFilterGroups(records);

    expect(groups.multi.map((g) => g.key)).toEqual([
      'branchIds',
      'weekdays',
      'scheduleLevels',
      'locations',
      'shifts',
    ]);
    expect(groups.multi[0].options).toEqual([
      { value: 2, label: 'Cơ sở 2' },
      { value: 3, label: 'Cơ sở 3' },
    ]);
    expect(groups.multi[4].options).toEqual([
      { value: 'Ca 1', label: 'Ca 1' },
      { value: 'Ca 2', label: 'Ca 2' },
    ]);
  });

  it('groups history records by date with formatted header and count label', () => {
    const grouped = groupHistoryRecordsByDate(records, 'student');

    expect(grouped).toHaveLength(2);
    expect(grouped[0]).toEqual({
      dateLabel: '09-08-2026',
      formattedDateHeader: 'Chủ Nhật, 09/08/2026',
      countLabel: '2 buổi',
      records: [records[0], records[1]],
    });
    expect(grouped[1]).toEqual({
      dateLabel: '15-04-2026',
      formattedDateHeader: 'Thứ Tư, 15/04/2026',
      countLabel: '1 buổi',
      records: [records[2]],
    });
  });
});


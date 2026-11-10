export interface CalendarDayInfo {
  dateString: string; // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function formatToDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns 1 (Monday) to 7 (Sunday)
 */
export function getDayOfWeekMonFirst(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

/**
 * Get 7 days of the week containing the given date (Monday to Sunday)
 */
export function getDaysOfWeek(centerDate: Date, todayDateStr: string = formatToDateString(new Date())): CalendarDayInfo[] {
  const current = new Date(centerDate.getFullYear(), centerDate.getMonth(), centerDate.getDate());
  const dayOfWeek = getDayOfWeekMonFirst(current);
  // Subtract days to reach Monday
  const monday = new Date(current);
  monday.setDate(current.getDate() - (dayOfWeek - 1));

  const days: CalendarDayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateString = formatToDateString(d);
    days.push({
      dateString,
      dayOfMonth: d.getDate(),
      dayOfWeek: getDayOfWeekMonFirst(d),
      isCurrentMonth: d.getMonth() === centerDate.getMonth(),
      isToday: dateString === todayDateStr,
    });
  }
  return days;
}

/**
 * Get grid of days for a month (4 to 6 weeks, Monday to Sunday)
 * Maximum 42 days (6 weeks * 7 days)
 */
export function getDaysOfMonth(year: number, monthZeroBased: number, todayDateStr: string = formatToDateString(new Date())): CalendarDayInfo[] {
  const firstOfMonth = new Date(year, monthZeroBased, 1);
  const firstDayOfWeek = getDayOfWeekMonFirst(firstOfMonth);
  
  // Starting Monday
  const startDate = new Date(year, monthZeroBased, 1 - (firstDayOfWeek - 1));
  
  const days: CalendarDayInfo[] = [];
  // 6 weeks = 42 days grid (perfect for backend 42-day limit)
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateString = formatToDateString(d);
    
    days.push({
      dateString,
      dayOfMonth: d.getDate(),
      dayOfWeek: getDayOfWeekMonFirst(d),
      isCurrentMonth: d.getMonth() === monthZeroBased,
      isToday: dateString === todayDateStr,
    });
  }
  
  const lastOfMonth = new Date(year, monthZeroBased + 1, 0);
  const totalDaysInMonth = lastOfMonth.getDate();
  const neededSlots = (firstDayOfWeek - 1) + totalDaysInMonth;
  const rowsNeeded = neededSlots <= 28 ? 4 : neededSlots <= 35 ? 5 : 6;
  
  return days.slice(0, rowsNeeded * 7);
}

export function formatVietnameseDayHeader(dateStr: string): string {
  const date = parseDateString(dateStr);
  const todayStr = formatToDateString(new Date());
  
  const dayNames = [
    'Chủ Nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ];
  
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  
  if (dateStr === todayStr) {
    return `Hôm nay, ${dd}/${mm}/${yyyy}`;
  }
  
  const dayOfWeek = date.getDay(); // 0 is Sunday
  return `${dayNames[dayOfWeek]}, ${dd}/${mm}/${yyyy}`;
}

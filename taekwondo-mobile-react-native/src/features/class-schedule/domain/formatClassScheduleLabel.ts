// Schedule ID thường có dạng P14C1
// P là Tối, A là sáng
// 1 là cơ sở
// 4 là thứ trong tuần
// C1 là ca 1, C2 là ca 2
export function getLabelClassSchedule(scheduleId: string) {
  if (!scheduleId) return "";

  // Dùng Regex để bóc tách chuỗi (thêm chữ i ở cuối để không phân biệt hoa thường)
  // Nhóm 1: ([A-Z])  -> Lấy chữ cái đầu tiên (P hoặc A)
  // Nhóm 2: (\d+)    -> Lấy phần số của cơ sở (hỗ trợ cả cơ sở có 2 chữ số như 10)
  // Nhóm 3: (\d)     -> Lấy 1 số tiếp theo làm Thứ (ví dụ: 4)
  // Nhóm 4: (C\d+)   -> Lấy phần Ca (ví dụ: C1, C2)
  const match = scheduleId.match(/^([A-Z])(\d+)(\d)(C\d+)$/i);

  // Nếu không đúng định dạng (match = null), trả về ID nguyên bản
  if (!match) return scheduleId;

  const [, timePart, branchPart, dayPart, caPart] = match;

  // Xử lý Time (chuyển về chữ hoa để so sánh cho an toàn)
  const timeUpper = timePart.toUpperCase();
  const timeLabel =
    timeUpper === "P" ? "Tối" : timeUpper === "A" ? "Sáng" : timeUpper;

  const branchLabel = `Cơ sở ${branchPart}`;
  const dayLabel = dayPart === "1" ? "Chủ nhật" : `Thứ ${dayPart}`;
  const caLabel = `Ca ${caPart.replace("C", "")}`;

  return `${dayLabel} - ${branchLabel} - ${timeLabel} - ${caLabel}`;
}

export function getLabelClassScheduleNoBranch(scheduleId: string) {
  if (!scheduleId) return "";

  // Dùng Regex để bóc tách chuỗi (thêm chữ i ở cuối để không phân biệt hoa thường)
  // Nhóm 1: ([A-Z])  -> Lấy chữ cái đầu tiên (P hoặc A)
  // Nhóm 2: (\d+)    -> Lấy phần số của cơ sở (hỗ trợ cả cơ sở có 2 chữ số như 10)
  // Nhóm 3: (\d)     -> Lấy 1 số tiếp theo làm Thứ (ví dụ: 4)
  // Nhóm 4: (C\d+)   -> Lấy phần Ca (ví dụ: C1, C2)
  const match = scheduleId.match(/^([A-Z])(\d+)(\d)(C\d+)$/i);

  // Nếu không đúng định dạng (match = null), trả về ID nguyên bản
  if (!match) return scheduleId;

  const [, timePart, , dayPart, caPart] = match;

  // Xử lý Time (chuyển về chữ hoa để so sánh cho an toàn)
  const timeUpper = timePart.toUpperCase();
  const timeLabel =
    timeUpper === "P" ? "Tối" : timeUpper === "A" ? "Sáng" : timeUpper;

  const dayLabel = dayPart === "1" ? "Chủ nhật" : `Thứ ${dayPart}`;
  const caLabel = `Ca ${caPart.replace("C", "")}`;

  return `${dayLabel} - ${timeLabel} - ${caLabel}`;
}

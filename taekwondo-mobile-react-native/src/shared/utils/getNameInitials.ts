export function getNameInitials(name: string | null | undefined): string {
  if (!name) return "?"; // Hoặc trả về "" tùy bạn

  return name
    .trim() // Xóa khoảng trắng thừa ở 2 đầu
    .split(/\s+/) // Dùng regex \s+ tốt hơn " " để phòng trường hợp user gõ 2 dấu cách liên tiếp
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

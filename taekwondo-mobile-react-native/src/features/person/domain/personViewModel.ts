export function relationshipLabel(value?: string | null) {
  switch (value) {
    case "OWNER":
      return "Chính chủ";
    case "GUARDIAN":
      return "Phụ huynh / người giám hộ";
    case "MANAGER":
      return "Quản lý";
    default:
      return value ?? "Chưa xác định";
  }
}

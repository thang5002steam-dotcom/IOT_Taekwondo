export function formatVnd(amount?: number | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return '0đ';
  }
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
}

export function formatNumberWithCommas(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const normalized = digits.replace(/^0+(?=\d)/, '');
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parseRawNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

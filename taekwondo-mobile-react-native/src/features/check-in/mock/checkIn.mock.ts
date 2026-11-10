import type { CheckInRecord } from '../types/checkIn.types';

export const MOCK_PERSONS: CheckInRecord[] = [
  {
    id: 'rec-001',
    personId: 'p-001',
    code: 'HV00456',
    fullName: 'Trần Khánh Linh',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    checkInTime: '18:28',
    dateLabel: 'Hôm nay',
    status: 'ON_TIME',
    statusLabel: 'Đúng giờ',
    timestamp: Date.now(),
  },
  {
    id: 'rec-002',
    personId: 'p-002',
    code: 'HV00123',
    fullName: 'Nguyễn Minh Anh',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&auto=format&fit=crop&q=80',
    checkInTime: '18:28',
    dateLabel: 'Hôm nay',
    status: 'ON_TIME',
    statusLabel: 'Đúng giờ',
    timestamp: Date.now() - 60000,
  },
  {
    id: 'rec-003',
    personId: 'p-003',
    code: 'NV00012',
    fullName: 'Đỗ Việt Dũng',
    role: 'COACH',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    checkInTime: '18:28',
    dateLabel: 'Hôm nay',
    status: 'ON_TIME',
    statusLabel: 'Đúng giờ',
    timestamp: Date.now() - 120000,
  },
  {
    id: 'rec-004',
    personId: 'p-004',
    code: 'HV00789',
    fullName: 'Lê Thu Hà',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    checkInTime: '18:28',
    dateLabel: 'Hôm nay',
    status: 'ON_TIME',
    statusLabel: 'Đúng giờ',
    timestamp: Date.now() - 180000,
  },
];

let personIndex = 0;

export function getNextMockPerson(): CheckInRecord {
  const person = MOCK_PERSONS[personIndex % MOCK_PERSONS.length];
  personIndex += 1;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return {
    ...person,
    id: `rec-${Date.now()}`,
    checkInTime: `${hours}:${minutes}`,
    timestamp: Date.now(),
  };
}

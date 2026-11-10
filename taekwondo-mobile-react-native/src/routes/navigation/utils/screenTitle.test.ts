import { renderHook } from '@testing-library/react-native';
import { resolveDetailTitle, useDynamicDetailTitle } from './screenTitle';

const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

describe('resolveDetailTitle algorithm', () => {
  it('resolves direct string title correctly', () => {
    expect(resolveDetailTitle('Taekwondo Cơ Bản')).toBe('Taekwondo Cơ Bản');
    expect(resolveDetailTitle('   Lớp Thiếu Nhi   ')).toBe('Lớp Thiếu Nhi');
  });

  it('extracts courseName from course entity', () => {
    const course = {
      courseId: 'c1',
      courseName: 'Khóa Học Quyền Đạo Sơ Cấp',
      branchName: 'Cơ sở 1',
    };
    expect(resolveDetailTitle(course, { fallback: 'Khóa học' })).toBe('Khóa Học Quyền Đạo Sơ Cấp');
  });

  it('extracts fullName from student entity', () => {
    const student = {
      personId: 'p1',
      fullName: 'Nguyễn Văn An',
      beltLabel: 'Đai Trắng',
    };
    expect(resolveDetailTitle(student, { fallback: 'Học viên' })).toBe('Nguyễn Văn An');
  });

  it('extracts name from generic API entity', () => {
    const apiCourse = {
      id: '123',
      name: 'Lớp Đối Kháng Nâng Cao',
    };
    expect(resolveDetailTitle(apiCourse)).toBe('Lớp Đối Kháng Nâng Cao');
  });

  it('supports custom key when specified', () => {
    const customEntity = {
      customLabel: 'Tiêu Đề Tùy Biến',
      name: 'Tên Phụ',
    };
    expect(resolveDetailTitle(customEntity, { key: 'customLabel' })).toBe('Tiêu Đề Tùy Biến');
  });

  it('falls back to routeTitle when entity is null or empty', () => {
    expect(resolveDetailTitle(null, { routeTitle: 'Tiêu Đề Từ Route' })).toBe('Tiêu Đề Từ Route');
    expect(resolveDetailTitle(undefined, { routeTitle: '  Route Name  ' })).toBe('Route Name');
  });

  it('strips legacy "Chi tiết " prefix from fallback title and capitalizes', () => {
    expect(resolveDetailTitle(null, { fallback: 'Chi tiết khóa học' })).toBe('Khóa học');
    expect(resolveDetailTitle(undefined, { fallback: 'Chi tiết: Học viên' })).toBe('Học viên');
    expect(resolveDetailTitle(null, { fallback: 'CHI TIẾT NGƯỜI DÙNG' })).toBe('NGƯỜI DÙNG');
  });

  it('truncates title exceeding maxLength safely with ellipsis', () => {
    const longTitle = 'Lớp Taekwondo Thiếu Nhi Phong Trào Toàn Diện Khóa Mùa Hè 2026';
    const result = resolveDetailTitle(longTitle, { maxLength: 25 });
    expect(result.length).toBeLessThanOrEqual(25);
    expect(result.endsWith('…')).toBe(true);
  });

  it('normalizes internal redundant whitespace', () => {
    const messy = '  Taekwondo   \n\t  Căn   Bản  ';
    expect(resolveDetailTitle(messy)).toBe('Taekwondo Căn Bản');
  });

  it('returns empty string if nothing resolves and no fallback provided', () => {
    expect(resolveDetailTitle(null)).toBe('');
  });
});

describe('useDynamicDetailTitle hook', () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReset();
  });

  it('uses entity name when entity exists even if route params has a title', async () => {
    mockUseLocalSearchParams.mockReturnValue({ title: 'Route Title' });
    const { result } = await renderHook(() =>
      useDynamicDetailTitle({ courseName: 'Entity Course Name' }),
    );
    expect(result.current).toBe('Entity Course Name');
  });

  it('uses route params title when entity is loading (null/undefined)', async () => {
    mockUseLocalSearchParams.mockReturnValue({ title: 'Tên Từ Route Params' });
    const { result } = await renderHook(() =>
      useDynamicDetailTitle(null, { fallback: 'Khóa học' }),
    );
    expect(result.current).toBe('Tên Từ Route Params');
  });

  it('falls back to cleaned fallback title when neither entity nor route param exists', async () => {
    mockUseLocalSearchParams.mockReturnValue({});
    const { result } = await renderHook(() =>
      useDynamicDetailTitle(null, { fallback: 'Chi tiết khóa học' }),
    );
    expect(result.current).toBe('Khóa học');
  });
});

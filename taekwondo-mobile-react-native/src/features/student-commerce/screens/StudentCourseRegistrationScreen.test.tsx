import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import type { CourseResponse } from '@/features/course/api/course.dto';
import { courseApi } from '@/features/course/api/courseApi';
import type { CoursePriceResponse } from '@/features/course-price/api/course-price.dto';
import { coursePriceApi } from '@/features/course-price/api/coursePriceApi';
import type { PersonSimpleResponse } from '@/features/person/api/person.dto';
import { personApi } from '@/features/person/api/personApi';
import { walletApi } from '@/features/wallet/api/walletApi';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import {
  mapCoursePriceToPackage,
  mapCourseResponseToRegistrationCourse,
  mapPersonToRegistrationStudent,
} from '../queries/courseRegistrationQueries';
import { StudentCourseRegistrationScreen } from './StudentCourseRegistrationScreen';

jest.mock('@/routes/navigation/layouts/StackScreenLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/shared/ui/BottomSheetWindow', () => ({
  BottomSheetWindow: ({
    visible,
    children,
  }: {
    visible: boolean;
    children: React.ReactNode;
  }) => {
    const { View } = require('react-native');
    return visible ? <View>{children}</View> : null;
  },
}));

jest.mock('@/features/person/api/personApi', () => ({
  personApi: { list: jest.fn() },
}));

jest.mock('@/features/course/api/courseApi', () => ({
  courseApi: { list: jest.fn() },
}));

jest.mock('@/features/course-price/api/coursePriceApi', () => ({
  coursePriceApi: { list: jest.fn() },
}));

jest.mock('@/features/wallet/api/walletApi', () => ({
  walletApi: { purchaseCourse: jest.fn() },
}));

const personApiListMock = personApi.list as jest.Mock;
const courseApiListMock = courseApi.list as jest.Mock;
const coursePriceApiListMock = coursePriceApi.list as jest.Mock;
const walletPurchaseCourseMock = walletApi.purchaseCourse as jest.Mock;

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  await act(async () => {
    fireEvent.press(target);
  });
}

function page<T>(content: T[]): PageResponse<T> {
  return {
    content,
    pageNumber: 0,
    pageSize: 20,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
}

async function renderWithClient(
  props: React.ComponentProps<typeof StudentCourseRegistrationScreen> = {},
) {
  const queryClient = createClient();
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <StudentCourseRegistrationScreen {...props} />
    </QueryClientProvider>,
  );

  return { ...screen, queryClient };
}

const person: PersonSimpleResponse = {
  personId: 'person-vq-00123',
  faceImagePath: null,
  fullName: 'Nguyễn Văn An',
  birthDate: '2014-01-01',
  gender: true,
  personCode: 'VQ_00123',
  currentBelt: 'C6',
  status: 'ACTIVE',
  position: null,
};

const course: CourseResponse = {
  courseId: 'course-basic',
  courseSchedules: [],
  name: 'Taekwondo Cơ bản',
  level: 'BASIC',
  capacity: 30,
  currentStudentCount: 0,
  status: 'OPEN',
  classSessionGeneratedUntil: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
};

const secondCourse: CourseResponse = {
  ...course,
  courseId: 'course-advanced',
  name: 'Taekwondo Nâng cao',
};

const coursePrice: CoursePriceResponse = {
  coursePriceId: 'price-3m',
  course,
  durationMonths: 3,
  sessionCount: 24,
  basePrice: 3000000,
  finalPrice: 3000000,
  status: 'ACTIVE',
};

describe('course registration view-model mappers', () => {
  it('maps person, course, and course price responses for registration UI', () => {
    expect(mapPersonToRegistrationStudent(person)).toMatchObject({
      personId: 'person-vq-00123',
      fullName: 'Nguyễn Văn An',
      personCode: 'VQ_00123',
      beltLabel: 'Xanh dương 1',
      statusLabel: 'Đang hoạt động',
    });
    expect(mapCourseResponseToRegistrationCourse(course)).toMatchObject({
      courseId: 'course-basic',
      courseName: 'Taekwondo Cơ bản',
      statusLabel: 'Mở đăng ký',
    });
    expect(mapCoursePriceToPackage(coursePrice)).toEqual({
      id: 'price-3m',
      label: '3 tháng · 24 buổi',
      durationLabel: '3 tháng',
      sessions: 24,
      amount: 3000000,
    });
  });
});

describe('StudentCourseRegistrationScreen', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    personApiListMock.mockResolvedValue(page([person]));
    courseApiListMock.mockResolvedValue(page([course]));
    coursePriceApiListMock.mockResolvedValue(page([coursePrice]));
    walletPurchaseCourseMock.mockResolvedValue({
      walletTransactionId: 'tx-1',
      walletId: 'wallet-1',
      type: 'COURSE_PURCHASE',
      direction: 'DEBIT',
      status: 'COMPLETED',
      amount: 3000000,
      balanceBefore: 2500000,
      balanceAfter: -500000,
      externalReference: 'MOBILE-1',
      coursePurchaseId: 'purchase-1',
      studentEnrollmentId: 'enrollment-1',
      reviewedAt: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders empty student/course/package state on entry', async () => {
    const screen = await renderWithClient();

    expect(screen.getByText('Chọn học viên')).toBeTruthy();
    expect(screen.getByText('Chọn khóa học')).toBeTruthy();
    expect(screen.getAllByText('--')).toHaveLength(2);
    expect(walletPurchaseCourseMock).not.toHaveBeenCalled();

    screen.queryClient.clear();
  });

  it('preselects course and package from route params', async () => {
    const screen = await renderWithClient({
      initialCourseId: 'basic',
      initialPackageId: 'basic-6m',
    });

    expect(screen.getByText('Taekwondo Cơ bản · Văn Quán')).toBeTruthy();
    expect(screen.getByText('6 tháng · 48 buổi')).toBeTruthy();
    expect(screen.getByText('Đã chọn')).toBeTruthy();

    screen.queryClient.clear();
  });

  it('selects student, course, package, then submits the purchase', async () => {
    const screen = await renderWithClient();

    await press(screen.getByLabelText('Chọn học viên'));
    await waitFor(() => expect(screen.getByText('Nguyễn Văn An')).toBeTruthy());
    await press(screen.getByLabelText('Chọn học viên Nguyễn Văn An'));

    await press(screen.getByLabelText('Chọn khóa học'));
    await waitFor(() => expect(screen.getByText('Taekwondo Cơ bản')).toBeTruthy());
    await press(screen.getByLabelText('Chọn khóa học Taekwondo Cơ bản'));

    await waitFor(() => expect(screen.getByText('3 tháng · 24 buổi')).toBeTruthy());
    await press(screen.getByText('3 tháng · 24 buổi'));
    await press(screen.getByText('Xác nhận đăng ký'));

    await waitFor(() =>
      expect(walletPurchaseCourseMock).toHaveBeenCalledWith(
        expect.objectContaining({
          studentPersonId: 'person-vq-00123',
          coursePriceId: 'price-3m',
          note: 'Đăng ký Taekwondo Cơ bản',
        }),
      ),
    );

    screen.queryClient.clear();
  });

  it('searches active students through the person endpoint', async () => {
    const screen = await renderWithClient();

    await press(screen.getByLabelText('Chọn học viên'));
    await waitFor(() => expect(personApiListMock).toHaveBeenCalledWith({
      search: undefined,
      status: 'ACTIVE',
      isStudent: true,
      page: 0,
      size: 20,
    }));

    screen.queryClient.clear();
  });

  it('debounces course search before calling the API', async () => {
    const screen = await renderWithClient();

    await press(screen.getByLabelText('Chọn khóa học'));
    await waitFor(() => expect(courseApiListMock).toHaveBeenCalledTimes(1));
    courseApiListMock.mockClear();

    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText('Tìm tên khóa học...'), 'can ban');
      await new Promise((resolve) => setTimeout(resolve, 450));
    });
    await waitFor(
      () =>
        expect(courseApiListMock).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'can ban', status: 'OPEN' }),
        ),
      { timeout: 900 },
    );

    screen.queryClient.clear();
  });

  it('clears selected package when choosing a different course', async () => {
    courseApiListMock.mockResolvedValue(page([course, secondCourse]));
    const screen = await renderWithClient();

    await press(screen.getByLabelText('Chọn khóa học'));
    await waitFor(() => expect(screen.getByText('Taekwondo Cơ bản')).toBeTruthy());
    await press(screen.getByLabelText('Chọn khóa học Taekwondo Cơ bản'));
    await waitFor(() => expect(screen.getByText('3 tháng · 24 buổi')).toBeTruthy());
    await press(screen.getByText('3 tháng · 24 buổi'));
    expect(screen.getByText('Đã chọn')).toBeTruthy();

    await press(screen.getByLabelText('Chọn khóa học'));
    await waitFor(() => expect(screen.getByText('Taekwondo Nâng cao')).toBeTruthy());
    await press(screen.getByLabelText('Chọn khóa học Taekwondo Nâng cao'));

    await waitFor(() => expect(screen.queryByText('Đã chọn')).toBeNull());

    screen.queryClient.clear();
  });
});

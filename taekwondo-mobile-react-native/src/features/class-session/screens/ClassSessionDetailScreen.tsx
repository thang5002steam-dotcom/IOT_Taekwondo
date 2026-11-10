import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

import type { CourseResponse } from "@/features/course/api/course.dto";
import { CourseLevelLabel, type CourseLevel } from "@/features/course/constants/course.constants";
import { CourseDetailContent } from "@/features/course/screens/CourseDetailContent";
import {
  WeekdayLabel,
  type Weekday,
} from "@/features/class-schedule/constants/class-schedule.constants";
import { ClassSessionActionButtons } from "../components/ClassSessionActionButtons";
import {
  getCalendarQuarterDateRange,
  type CalendarQuarter,
} from "@/features/attendance-history/domain/historyDateRange";
import { SurfaceCard } from "@/shared/ui/commerce/CommercePrimitives";
import type { CourseView } from "@/features/course/domain/course.types";
import { mapCourseApiToView } from "@/features/course/domain/course.mappers";
import { asHref } from "@/features/student-commerce/utils/studentCommerceUtils";

import { useClassSessionDetail } from "../queries/classSessionQueries";

type LearningProgress = {
  completed: number;
  total: number;
  percent: number;
};

function formatTime(time?: string) {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  return hour && minute ? `${hour}:${minute}` : time;
}

function mapCourseToDetailView(
  course: CourseResponse,
  snapshotLevel?: CourseLevel,
): CourseView {
  const schedule = course.courseSchedules[0]?.classSchedule;
  const weekdayLabel = schedule?.weekday
    ? WeekdayLabel[schedule.weekday as Weekday] ?? schedule.weekday
    : "";
  const displayLevel = snapshotLevel ?? course.level;
  const levelLabel = CourseLevelLabel[displayLevel] ?? displayLevel;
  const timeLabel =
    schedule?.startTime && schedule?.endTime
      ? `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`
      : "";
  const scheduleLabel =
    [weekdayLabel, levelLabel, timeLabel].filter(Boolean).join(" · ") ||
    "Lịch học linh hoạt";
  const mappedCourse = mapCourseApiToView(course);

  return {
    ...mappedCourse,
    branchName: schedule?.branch?.name ?? "Văn Quán",
    levelLabel,
    scheduleLabel,
  };
}

function getQuarterFromDate(date: string): CalendarQuarter {
  const month = Number(date.slice(5, 7));
  if (!Number.isFinite(month) || month < 1 || month > 12) return 1;
  return (Math.floor((month - 1) / 3) + 1) as CalendarQuarter;
}

function getAttendanceHistoryParams(
  courseId: string,
  sessionDate?: string,
  courseName?: string,
) {
  const date = sessionDate || new Date().toISOString().slice(0, 10);
  const year = Number(date.slice(0, 4));
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const range = getCalendarQuarterDateRange(safeYear, getQuarterFromDate(date));
  const query = new URLSearchParams({
    courseId,
    ...(courseName ? { courseName } : {}),
    from: range.from,
    to: range.to,
  });

  return `/history/student?${query.toString()}`;
}

function LearningProgressCard({ progress }: { progress: LearningProgress }) {
  return (
    <SurfaceCard>
      <View style={styles.progressHeader}>
        <ThemedText type="subtitle" style={styles.blackText}>
          Tiến trình học
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.progressPercent}>
          {progress.percent}%
        </ThemedText>
      </View>
      <ThemedText type="bodySmall" style={styles.secondaryText}>
        Đã hoàn thành {progress.completed}/{progress.total} buổi
      </ThemedText>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: progress.percent,
          text: `Đã hoàn thành ${progress.completed}/${progress.total} buổi`,
        }}
        style={styles.progressTrack}
      >
        <View
          style={[styles.progressFill, { width: `${progress.percent}%` }]}
        />
      </View>
    </SurfaceCard>
  );
}

function StateCard({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.stateCard}>
      <ThemedText type="body" style={styles.stateTitle}>
        {title}
      </ThemedText>
      <ThemedText type="bodySmall" style={styles.stateDescription}>
        {description}
      </ThemedText>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thử lại"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <ThemedText type="bodySmall" style={styles.retryText}>
            Thử lại
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ClassSessionDetailScreen({
  classSessionId,
}: {
  classSessionId?: string;
}) {
  const router = useRouter();
  const sessionQuery = useClassSessionDetail(classSessionId);

  const course = sessionQuery.data?.course
    ? mapCourseToDetailView(
        sessionQuery.data.course,
        sessionQuery.data.scheduleLevel,
      )
    : undefined;
  const progress = sessionQuery.data?.learningProgress ?? {
    completed: 0,
    total: 0,
    percent: 0,
  };

  return (
    <StackScreenLayout
      title="Chi tiết buổi tập"
      contentContainerStyle={styles.content}
      floatingContent={
        course && classSessionId ? (
          <ClassSessionActionButtons
            onHistoryPress={() =>
              router.push(
                asHref(
                  getAttendanceHistoryParams(
                    course.courseId,
                    sessionQuery.data?.sessionDate,
                    course.courseName,
                  ),
                ),
              )
            }
            onEvaluatePress={() =>
              router.push(asHref(`/class-sessions/${classSessionId}/attendance`))
            }
          />
        ) : undefined
      }
    >
      {!classSessionId ? (
        <StateCard
          title="Không tìm thấy buổi tập"
          description="Thiếu mã buổi tập để tải chi tiết."
        />
      ) : sessionQuery.isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText type="bodySmall" style={styles.secondaryText}>
            Đang tải chi tiết buổi tập...
          </ThemedText>
        </View>
      ) : sessionQuery.isError ? (
        <StateCard
          title="Không thể tải chi tiết buổi tập"
          description="Đã xảy ra lỗi trong quá trình tải dữ liệu. Vui lòng thử lại."
          onRetry={() => sessionQuery.refetch()}
        />
      ) : !course ? (
        <StateCard
          title="Không tìm thấy buổi tập"
          description="Buổi tập này không còn tồn tại hoặc bạn không có quyền truy cập."
        />
      ) : (
        <CourseDetailContent
          course={course}
          topContent={<LearningProgressCard progress={progress} />}
          onOpenCoaches={() =>
            router.push(asHref(`/courses/${course.courseId}/members/coaches`))
          }
          onOpenAssistants={() =>
            router.push(asHref(`/courses/${course.courseId}/members/teaching-assistants`))
          }
          onOpenStudents={() =>
            router.push(asHref(`/courses/${course.courseId}/members/students`))
          }
          onOpenPackage={(packageId) =>
            router.push(
              asHref(`/courses/${course.courseId}/packages/${packageId}`),
            )
          }
        />
      )}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressPercent: {
    color: Colors.light.primary,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.12),
    marginTop: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: Colors.light.primary,
  },
  loadingState: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateCard: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
  },
  stateTitle: {
    color: Colors.light.text,
    textAlign: "center",
  },
  stateDescription: {
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
  },
  retryText: {
    color: Colors.light.surface,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
  },
});

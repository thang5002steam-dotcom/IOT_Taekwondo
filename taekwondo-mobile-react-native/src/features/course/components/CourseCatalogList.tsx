import { CourseCatalogCard } from "@/features/student-commerce/components/StudentCommercePrimitives";
import type { CourseView } from "@/features/course/domain/course.types";

export function CourseCatalogList({
  courses,
  onCoursePress,
}: {
  courses: CourseView[];
  onCoursePress: (courseId: string) => void;
}) {
  return (
    <>
      {courses.map((course) => (
        <CourseCatalogCard
          key={course.courseId}
          course={course}
          onPress={() => onCoursePress(course.courseId)}
        />
      ))}
    </>
  );
}

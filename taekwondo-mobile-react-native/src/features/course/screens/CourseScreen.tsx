import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { CourseResponse } from "@/features/course/api/course.dto";
import { CourseCatalogList } from "@/features/course/components/CourseCatalogList";
import { CourseCatalogSearchField } from "@/features/course/components/CourseCatalogSearchField";
import { CourseCreateSheet } from "@/features/course/components/CourseCreateSheet";
import { Permission, useCan } from "@/features/authorization";
import { COURSE_CATALOG_TABS } from "@/features/course/utils/courseCatalogViewModel";
import { SegmentedTabs } from "@/shared/ui/commerce/CommercePrimitives";
import type { CourseCatalogTab } from "@/features/course/domain/course.types";
import {
  asHref,
  getCommerceState,
} from "@/features/student-commerce/utils/studentCommerceUtils";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import { Colors } from "@/theme";

import { useCourseCatalog } from "@/features/course/queries/courseCatalogQueries";

export function CourseCatalogScreen({
  initialTab = "active",
}: {
  initialTab?: CourseCatalogTab;
}) {
  const router = useRouter();
  const state = getCommerceState();
  const [tab, setTab] = useState<CourseCatalogTab>(initialTab);
  const [search, setSearch] = useState("");
  const [isCreateSheetVisible, setIsCreateSheetVisible] = useState(false);
  const canCreateCourse = useCan(Permission.COURSE_CREATE);

  const coursesQuery = useCourseCatalog(state.courses, tab);
  const { data, isLoading, courses, registerCreatedCourse } = coursesQuery;
  const { refreshing, onRefresh } = useScreenRefresh([coursesQuery]);

  const showInitialLoading = isLoading && !data;
  const visibleCourses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi-VN");
    if (!query) return courses;
    return courses.filter((course) =>
      [course.courseName, course.branchName, course.scheduleLabel, course.subtitle]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("vi-VN").includes(query)),
    );
  }, [courses, search]);

  const handleCreateSuccess = async (createdCourse: CourseResponse) => {
    await registerCreatedCourse(createdCourse);
    setIsCreateSheetVisible(false);
    router.push(asHref(`/courses/${createdCourse.courseId}`));
  };

  return (
    <>
      <StackScreenLayout
        title="Khóa học"
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <SegmentedTabs value={tab} tabs={COURSE_CATALOG_TABS} onChange={setTab} />
        <CourseCatalogSearchField
          tab={tab}
          value={search}
          onChangeText={setSearch}
          onCreatePress={
            canCreateCourse ? () => setIsCreateSheetVisible(true) : undefined
          }
        />
        {showInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <CourseCatalogList
            courses={visibleCourses}
            onCoursePress={(courseId) =>
              router.push(asHref(`/courses/${courseId}`))
            }
          />
        )}
      </StackScreenLayout>

      <CourseCreateSheet
        visible={isCreateSheetVisible}
        onClose={() => setIsCreateSheetVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});

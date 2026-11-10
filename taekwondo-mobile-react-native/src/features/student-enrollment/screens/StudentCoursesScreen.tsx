import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors } from "@/theme";

import {
  EnrollmentCard,
  SegmentedTabs,
} from "@/features/student-commerce/components/StudentCommercePrimitives";
import type { StudentCourseTab, StudentRouteProps } from "@/features/student-commerce/types";
import { asHref, getCommerceState } from "@/features/student-commerce/utils/studentCommerceUtils";

export function StudentCoursesScreen({ studentCode }: StudentRouteProps) {
  const router = useRouter();
  const state = getCommerceState();
  const [tab, setTab] = useState<StudentCourseTab>("current");
  const enrollments = state.enrollments.filter((item) =>
    tab === "history" ? item.history : !item.history,
  );

  return (
    <StackScreenLayout title="Khóa học" contentContainerStyle={styles.content}>
      <SegmentedTabs
        value={tab}
        tabs={[
          { value: "current", label: "Hiện tại" },
          { value: "history", label: "Lịch sử" },
        ]}
        onChange={setTab}
      />
      <View>
        <ThemedText type="title" style={styles.blackText}>
          {tab === "current"
            ? `${enrollments.length} khóa học đang học`
            : `${enrollments.length} khóa học lịch sử`}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.secondaryText}>
          Tiến độ riêng từng khóa
        </ThemedText>
      </View>
      {enrollments.map((enrollment) => (
        <EnrollmentCard
          key={enrollment.enrollmentId}
          enrollment={enrollment}
          onPress={() =>
            router.push(
              asHref(
                `/students/${studentCode ?? state.selectedStudent.personCode}/courses/${enrollment.enrollmentId}`,
              ),
            )
          }
        />
      ))}
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
});

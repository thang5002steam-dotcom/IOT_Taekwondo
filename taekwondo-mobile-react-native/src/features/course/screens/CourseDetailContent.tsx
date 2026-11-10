import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  ChevronRight,
  User,
  Users,
} from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

import { CourseScheduleDetailWindow } from "@/features/course/components/CourseScheduleDetailWindow";
import { CourseScheduleSection } from "@/features/course/components/CourseScheduleSection";
import type { CourseScheduleView } from "@/features/course/domain/course.types";
import {
  PackageSheet,
  SurfaceCard,
} from "@/features/student-commerce/components/StudentCommercePrimitives";
import type { CourseView } from "@/features/student-commerce/types";
import { CourseInformationSection } from "../components/CourseInformationSection";

export function CourseDetailContent({
  course,
  topContent,
  onOpenCoaches,
  onOpenAssistants,
  onOpenStudents,
  onOpenPackage,
  onOpenSchedules,
  onEditSchedule,
  onToggleScheduleStatus,
  onDeleteSchedule,
  onCancelScheduleDelete,
  packageSheetVisible: controlledPackageSheetVisible,
  onOpenPackageSheet,
  onClosePackageSheet,
  scheduleDeletePending = false,
  scheduleActionPending = false,
}: {
  course: CourseView;
  topContent?: ReactNode;
  onOpenCoaches: () => void;
  onOpenAssistants: () => void;
  onOpenStudents: () => void;
  onOpenPackage: (packageId: string) => void;
  packageSheetVisible?: boolean;
  onOpenPackageSheet?: () => void;
  onClosePackageSheet?: () => void;
  onOpenSchedules?: () => void;
  onEditSchedule?: (schedule: CourseScheduleView) => void;
  onToggleScheduleStatus?: (schedule: CourseScheduleView) => void;
  onDeleteSchedule?: (schedule: CourseScheduleView) => Promise<boolean>;
  onCancelScheduleDelete?: () => void;
  scheduleDeletePending?: boolean;
  scheduleActionPending?: boolean;
}) {
  const [internalPackageSheetVisible, setInternalPackageSheetVisible] =
    useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<CourseScheduleView>();

  const isPackageSheetVisible =
    controlledPackageSheetVisible !== undefined
      ? controlledPackageSheetVisible
      : internalPackageSheetVisible;

  const handleOpenPackageSheet = () => {
    if (onOpenPackageSheet) {
      onOpenPackageSheet();
    } else {
      setInternalPackageSheetVisible(true);
    }
  };

  const handleClosePackageSheet = () => {
    if (onClosePackageSheet) {
      onClosePackageSheet();
    } else {
      setInternalPackageSheetVisible(false);
    }
  };

  const enrolled = course.enrolledStudentCount ?? 0;

  return (
    <>
      {topContent}

      <CourseInformationSection
        statusLabel={course.statusLabel}
        levelLabel={course.levelLabel}
        capacity={course.capacity ?? 0}
        enrolled={course.enrolledStudentCount ?? 0}
      />

      <CourseScheduleSection
        schedules={course.schedules}
        onOpenSchedule={setSelectedSchedule}
        onSeeMore={onOpenSchedules}
      />

      <SurfaceCard soft style={styles.rosterCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xem danh sách huấn luyện viên"
          onPress={onOpenCoaches}
          style={({ pressed }) => [
            styles.rosterRow,
            pressed ? styles.btnPressed : null,
          ]}
        >
          <View style={styles.rosterLeft}>
            <View style={styles.rosterIconContainer}>
              <AppIcon icon={<User />} size={20} color={Colors.light.primary} />
            </View>
            <View>
              <ThemedText type="bodySmall" style={styles.blackTextBold}>
                Huấn luyện viên ({course.coachCount})
              </ThemedText>
              <ThemedText type="caption" style={styles.secondaryText}>
                {course.coachCount > 0
                  ? `${course.coachCount} huấn luyện viên phụ trách`
                  : "Chưa phân công huấn luyện viên"}
              </ThemedText>
            </View>
          </View>
          <AppIcon
            icon={<ChevronRight />}
            size={18}
            color={Colors.light.textSecondary}
          />
        </Pressable>

        <View style={styles.rowDivider} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xem danh sách trợ giảng"
          onPress={onOpenAssistants}
          style={({ pressed }) => [
            styles.rosterRow,
            pressed ? styles.btnPressed : null,
          ]}
        >
          <View style={styles.rosterLeft}>
            <View style={styles.rosterIconContainer}>
              <AppIcon icon={<User />} size={20} color={Colors.light.primary} />
            </View>
            <View>
              <ThemedText type="bodySmall" style={styles.blackTextBold}>
                Trợ giảng ({course.assistantCount})
              </ThemedText>
              <ThemedText type="caption" style={styles.secondaryText}>
                {course.assistantCount > 0
                  ? `${course.assistantCount} trợ giảng phụ trách`
                  : "Chưa phân công trợ giảng"}
              </ThemedText>
            </View>
          </View>
          <AppIcon
            icon={<ChevronRight />}
            size={18}
            color={Colors.light.textSecondary}
          />
        </Pressable>

        <View style={styles.rowDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xem danh sách học viên"
          onPress={onOpenStudents}
          style={({ pressed }) => [
            styles.rosterRow,
            pressed ? styles.btnPressed : null,
          ]}
        >
          <View style={styles.rosterLeft}>
            <View style={styles.rosterIconContainer}>
              <AppIcon
                icon={<Users />}
                size={20}
                color={Colors.light.primary}
              />
            </View>
            <View>
              <ThemedText type="bodySmall" style={styles.blackTextBold}>
                Học viên ({enrolled})
              </ThemedText>
              <ThemedText type="caption" style={styles.secondaryText}>
                {enrolled} học viên chính thức
              </ThemedText>
            </View>
          </View>
          <AppIcon
            icon={<ChevronRight />}
            size={18}
            color={Colors.light.textSecondary}
          />
        </Pressable>
      </SurfaceCard>

      <PackageSheet
        visible={isPackageSheetVisible}
        course={course}
        onClose={handleClosePackageSheet}
        onOpenPackage={(packageId) => {
          onOpenPackage(packageId);
          setTimeout(() => {
            handleClosePackageSheet();
          }, 100);
        }}
      />
      <CourseScheduleDetailWindow
        schedule={selectedSchedule}
        onClose={() => setSelectedSchedule(undefined)}
        onEdit={onEditSchedule}
        onToggleStatus={onToggleScheduleStatus}
        onDelete={onDeleteSchedule}
        onCancelDelete={onCancelScheduleDelete}
        deleting={scheduleDeletePending}
        actionPending={scheduleActionPending}
      />
    </>
  );
}

const styles = StyleSheet.create({
  blackTextBold: {
    color: Colors.light.text,
    fontWeight: "bold",
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  rowDivider: {
    height: 1,
    backgroundColor: hexToRgba(Colors.light.divider, 0.3),
  },
  rosterCard: {
    padding: 0,
    overflow: "hidden",
  },
  rosterRow: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rosterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rosterIconContainer: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    opacity: 0.75,
  },
});

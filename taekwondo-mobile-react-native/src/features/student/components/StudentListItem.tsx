import { Image, Pressable, StyleSheet, View } from "react-native";

import type { PersonSimpleResponse } from "@/features/person";
import { SurfaceCard } from "@/shared/ui/commerce/CommercePrimitives";
import type { StudentSummaryView } from "@/features/student-commerce/types";
import { getStudentInitials } from "@/features/student/utils/studentListViewModel";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, hexToRgba, radii } from "@/theme";

import { PersonListItem } from "@/features/person/components/PersonListItem";
import { StudentStatusPill } from "./StudentStatusPill";

export type StudentItemData = StudentSummaryView | PersonSimpleResponse;

function isPersonSimpleResponse(
  student: StudentItemData,
): student is PersonSimpleResponse {
  return "personId" in student;
}

export function StudentListItem({
  student,
  onPress,
}: {
  student: StudentItemData;
  onPress: () => void;
}) {
  if (isPersonSimpleResponse(student)) {
    return (
      <PersonListItem
        person={student}
        onPress={onPress}
        statusLabelMap={{
          ACTIVE: "Đang học",
          INACTIVE: "Bảo lưu",
          SUSPENDED: "Tạm ngưng",
        }}
      />
    );
  }

  const fullName = student.fullName;
  const beltText = student.beltLabel;
  const statusLabel = student.statusLabel;
  const subtitle = student.personCode;
  const faceImagePath =
    "faceImagePath" in student
      ? (student as { faceImagePath?: string | null }).faceImagePath
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem học viên ${fullName}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <SurfaceCard>
        <View style={styles.row}>
          {faceImagePath ? (
            <Image source={{ uri: faceImagePath }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <ThemedText type="title" style={styles.avatarText}>
                {getStudentInitials(fullName)}
              </ThemedText>
            </View>
          )}
          <View style={styles.flex}>
            <ThemedText
              type="bodySmall"
              style={styles.blackText}
              numberOfLines={1}
            >
              {fullName}
            </ThemedText>
            <ThemedText
              type="bodySmall"
              style={styles.secondaryText}
              numberOfLines={1}
            >
              {beltText}
            </ThemedText>
          </View>
          <StudentStatusPill label={statusLabel} />
        </View>
        <ThemedText
          type="bodySmall"
          style={styles.secondaryText}
          numberOfLines={1}
        >
          {subtitle}
        </ThemedText>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: hexToRgba(Colors.light.primary, 0.08),
  },
  avatarText: {
    color: Colors.light.text,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  blackText: {
    color: Colors.light.text,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
});

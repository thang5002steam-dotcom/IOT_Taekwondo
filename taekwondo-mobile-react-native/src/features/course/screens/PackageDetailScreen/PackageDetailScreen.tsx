import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { File, Gift, ShieldCheck } from "reicon-react-native";

import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, typography } from "@/theme";

import type { CourseRouteProps } from "@/features/student-commerce/types";
import {
  asHref,
  formatVnd,
  getCommerceState,
  getCourse,
  getPackage,
} from "@/features/student-commerce/utils/studentCommerceUtils";

import { PackageHeroCard } from "./PackageHeroCard";
import { PackageRegisterButton } from "./PackageRegisterButton";
import {
  BenefitLine,
  PackageInfoRow,
  PackageSectionCard,
} from "./PackageSectionCard";

export function PackageDetailScreen({ courseId, packageId }: CourseRouteProps) {
  const router = useRouter();
  const state = getCommerceState();
  const course = getCourse(state.courses, courseId);
  const item = getPackage(course, packageId)!;

  const handleRegister = () => {
    router.push(
      asHref(`/courses/${course.courseId}/packages/${item.id}/register`),
    );
  };

  return (
    <StackScreenLayout
      title="Chi tiết gói học"
      contentContainerStyle={styles.content}
      floatingContent={<PackageRegisterButton onPress={handleRegister} />}
    >
      <View style={styles.titleBlock}>
        <ThemedText type="featureLabel" style={styles.eyebrow}>
          KHÓA HỌC
        </ThemedText>
        <ThemedText type="heading" style={styles.courseTitle}>
          {course.courseName}
        </ThemedText>
      </View>

      <PackageHeroCard item={item} />

      <PackageSectionCard icon={<Gift />} title="Bạn nhận được">
        <BenefitLine>
          {item.sessions} buổi học theo lịch của khóa học đã chọn
        </BenefitLine>
        <BenefitLine>
          Không có buổi tặng hoặc ưu đãi bổ sung trong dữ liệu hiện tại
        </BenefitLine>
      </PackageSectionCard>

      <PackageSectionCard icon={<File />} title="Thông tin gói">
        <View style={styles.infoRows}>
          <PackageInfoRow label="Số buổi" value={`${item.sessions} buổi`} />
          <PackageInfoRow label="Thời hạn" value={item.durationLabel} />
          <PackageInfoRow
            label="Giá"
            value={formatVnd(item.amount)}
            showDivider={false}
          />
        </View>
      </PackageSectionCard>

      <PackageSectionCard icon={<ShieldCheck />} title="Điều kiện & chính sách">
        <BenefitLine>Áp dụng khi khóa học đang mở đăng ký.</BenefitLine>
        <BenefitLine>
          Thời hạn sử dụng được tính theo kỳ học sau khi đăng ký.
        </BenefitLine>
        <BenefitLine>
          Các chính sách khác áp dụng theo quy định hiện hành của trung tâm.
        </BenefitLine>
      </PackageSectionCard>
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 128,
  },
  titleBlock: {
    gap: 4,
  },
  eyebrow: {
    color: Colors.light.primary,
    letterSpacing: 2,
  },
  courseTitle: {
    color: Colors.light.text,
    ...typography.heading,
    fontSize: 24,
    lineHeight: 32,
  },
  infoRows: {
    gap: 0,
  },
  policyText: {
    color: Colors.light.text,
    lineHeight: 24,
  },
});

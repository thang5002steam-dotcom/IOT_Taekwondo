import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  AdminButton,
  AdminChip,
  AdminField,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, Spacing } from "@/theme";
import type { CoursePriceCreateRequest } from "../api/course-price.dto";
import type { CoursePriceStatus } from "../constants/course-price.constants";
import type { CoursePriceItemView } from "../domain/course-price.types";
import { formatNumberWithCommas, parseRawNumber } from "@/shared/utils/currency";

export type CoursePriceFormSheetProps = {
  visible: boolean;
  mode: "create" | "edit";
  courseId: string;
  coursePrice?: CoursePriceItemView | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (request: CoursePriceCreateRequest) => void;
};

const COMMON_DURATIONS = [1, 3, 6, 12];
const COMMON_SESSIONS = [8, 24, 48, 72];

export function CoursePriceFormSheet(props: CoursePriceFormSheetProps) {
  if (!props.visible) {
    return (
      <BottomSheetWindow visible={false} title="" onClose={props.onClose}>
        <View />
      </BottomSheetWindow>
    );
  }

  return (
    <CoursePriceFormSheetActive
      key={`${props.mode}-${props.coursePrice?.id ?? "create"}`}
      {...props}
    />
  );
}

function CoursePriceFormSheetActive({
  visible,
  mode,
  courseId,
  coursePrice,
  submitting = false,
  onClose,
  onSubmit,
}: CoursePriceFormSheetProps) {
  const isEdit = mode === "edit";

  const [durationMonths, setDurationMonths] = useState(() =>
    isEdit && coursePrice ? String(coursePrice.durationMonths) : "3",
  );
  const [sessionCount, setSessionCount] = useState(() =>
    isEdit && coursePrice ? String(coursePrice.sessionCount) : "24",
  );
  const [basePrice, setBasePrice] = useState(() =>
    isEdit && coursePrice && coursePrice.basePrice !== undefined
      ? formatNumberWithCommas(coursePrice.basePrice)
      : "",
  );
  const [finalPrice, setFinalPrice] = useState(() =>
    isEdit && coursePrice ? formatNumberWithCommas(coursePrice.finalPrice) : "",
  );
  const [status, setStatus] = useState<CoursePriceStatus>(() =>
    isEdit && coursePrice ? coursePrice.status : "ACTIVE",
  );
  const [attempted, setAttempted] = useState(false);

  const errors = useMemo(() => {
    const dur = Number(durationMonths);
    const ses = Number(sessionCount);
    const fin = parseRawNumber(finalPrice);
    const base = basePrice ? parseRawNumber(basePrice) : undefined;

    return {
      durationMonths:
        !durationMonths || Number.isNaN(dur) || dur <= 0
          ? "Thời hạn phải là số tháng lớn hơn 0."
          : undefined,
      sessionCount:
        !sessionCount || Number.isNaN(ses) || ses <= 0
          ? "Số buổi học phải là số lớn hơn 0."
          : undefined,
      finalPrice:
        !finalPrice || fin <= 0
          ? "Học phí thực thu phải là số lớn hơn 0."
          : undefined,
      basePrice:
        base !== undefined && base < 0
          ? "Học phí gốc phải là số không âm."
          : undefined,
    };
  }, [basePrice, durationMonths, finalPrice, sessionCount]);

  const isValid =
    !errors.durationMonths &&
    !errors.sessionCount &&
    !errors.finalPrice &&
    !errors.basePrice;

  const handleSubmit = () => {
    setAttempted(true);
    if (!isValid) return;

    const parsedFinal = parseRawNumber(finalPrice);
    const parsedBase = basePrice ? parseRawNumber(basePrice) : parsedFinal;

    onSubmit({
      courseId,
      durationMonths: Math.round(Number(durationMonths)),
      sessionCount: Math.round(Number(sessionCount)),
      basePrice: parsedBase,
      finalPrice: parsedFinal,
      status,
    });
  };

  const title = isEdit ? "Chỉnh sửa gói học" : "Tạo gói học mới";
  const submitLabel = isEdit ? "Lưu thay đổi" : "Tạo gói học";

  return (
    <BottomSheetWindow
      visible={visible}
      title={title}
      heightRatio={0.88}
      accessibilityLabel={`Biểu mẫu ${isEdit ? "chỉnh sửa" : "tạo mới"} gói học`}
      onClose={onClose}
      footer={
        <View style={styles.footer}>
          <AdminButton
            label="Hủy"
            variant="secondary"
            disabled={submitting}
            onPress={onClose}
            style={styles.footerButton}
          />
          <AdminButton
            label={submitLabel}
            loading={submitting}
            onPress={handleSubmit}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <AdminField
            label="Thời hạn (tháng) *"
            value={durationMonths}
            placeholder="Nhập số tháng (ví dụ: 3)"
            keyboardType="number-pad"
            editable={!submitting}
            onChangeText={setDurationMonths}
          />
          <View style={styles.quickChips}>
            {COMMON_DURATIONS.map((dur) => (
              <AdminChip
                key={dur}
                label={`${dur} tháng`}
                selected={durationMonths === String(dur)}
                onPress={
                  submitting ? undefined : () => setDurationMonths(String(dur))
                }
              />
            ))}
          </View>
          {attempted && errors.durationMonths && (
            <ThemedText
              accessibilityRole="alert"
              type="bodySmall"
              style={styles.errorText}
            >
              {errors.durationMonths}
            </ThemedText>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <AdminField
            label="Số buổi học *"
            value={sessionCount}
            placeholder="Nhập số buổi (ví dụ: 24)"
            keyboardType="number-pad"
            editable={!submitting}
            onChangeText={setSessionCount}
          />
          <View style={styles.quickChips}>
            {COMMON_SESSIONS.map((ses) => (
              <AdminChip
                key={ses}
                label={`${ses} buổi`}
                selected={sessionCount === String(ses)}
                onPress={
                  submitting ? undefined : () => setSessionCount(String(ses))
                }
              />
            ))}
          </View>
          {attempted && errors.sessionCount && (
            <ThemedText
              accessibilityRole="alert"
              type="bodySmall"
              style={styles.errorText}
            >
              {errors.sessionCount}
            </ThemedText>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <AdminField
            label="Học phí gốc (VNĐ)"
            value={basePrice}
            placeholder="Để trống nếu bằng giá bán (ví dụ: 1,500,000)"
            keyboardType="numeric"
            editable={!submitting}
            onChangeText={(text) => setBasePrice(formatNumberWithCommas(text))}
          />
          {attempted && errors.basePrice && (
            <ThemedText
              accessibilityRole="alert"
              type="bodySmall"
              style={styles.errorText}
            >
              {errors.basePrice}
            </ThemedText>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <AdminField
            label="Học phí thực thu / Giá bán (VNĐ) *"
            value={finalPrice}
            placeholder="Nhập học phí áp dụng (ví dụ: 1,200,000)"
            keyboardType="numeric"
            editable={!submitting}
            onChangeText={(text) => setFinalPrice(formatNumberWithCommas(text))}
          />
          {attempted && errors.finalPrice && (
            <ThemedText
              accessibilityRole="alert"
              type="bodySmall"
              style={styles.errorText}
            >
              {errors.finalPrice}
            </ThemedText>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText type="featureLabel">Trạng thái gói học *</ThemedText>
          <View style={styles.statusChips}>
            <AdminChip
              label="Đang áp dụng"
              tone="success"
              selected={status === "ACTIVE"}
              onPress={submitting ? undefined : () => setStatus("ACTIVE")}
            />
            <AdminChip
              label="Ngừng áp dụng"
              selected={status === "INACTIVE"}
              onPress={submitting ? undefined : () => setStatus("INACTIVE")}
            />
          </View>
        </View>
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 6,
  },
  quickChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  statusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  errorText: {
    color: Colors.light.error,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  footerButton: {
    flex: 1,
  },
});

import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import {
  AdminButton,
  AdminChip,
  AdminField,
} from "@/shared/ui/admin/AdministrationPrimitives";
import {
  formatNumberWithCommas,
  parseRawNumber,
} from "@/shared/utils/currency";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type {
  ScheduleLevel,
  TrainingPlanCreateRequest,
  TrainingPlanSimpleResponse,
  TrainingPlanStatus,
} from "../api/trainingPlan.dto";

type Form = {
  name: string;
  level: ScheduleLevel;
  durationMonths: string;
  includedSessionCount: string;
  basePrice: string;
  finalPrice: string;
  status: TrainingPlanStatus;
};
const initial: Form = {
  name: "",
  level: "BASIC",
  durationMonths: "1",
  includedSessionCount: "8",
  basePrice: "",
  finalPrice: "",
  status: "ACTIVE",
};

function planToForm(plan: TrainingPlanSimpleResponse): Form {
  return {
    name: plan.name,
    level: plan.level,
    durationMonths: String(plan.durationMonths),
    includedSessionCount: String(plan.includedSessionCount),
    basePrice: formatNumberWithCommas(plan.basePrice),
    finalPrice: formatNumberWithCommas(plan.finalPrice),
    status: plan.status,
  };
}

// Extracted so the `key` prop can force a remount (and useState reset)
// each time the sheet opens — avoids setState-in-effect and ref-in-render.
function FormBody({
  plan,
  submitting,
  onClose,
  onSubmit,
}: {
  plan?: TrainingPlanSimpleResponse | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (request: TrainingPlanCreateRequest) => void;
}) {
  const [form, setForm] = useState<Form>(plan ? planToForm(plan) : initial);
  const set = (key: keyof Form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setCurrency = (key: "basePrice" | "finalPrice", value: string) =>
    set(key, formatNumberWithCommas(value));
  const valid =
    form.name.trim() &&
    Number(form.durationMonths) > 0 &&
    Number(form.includedSessionCount) > 0 &&
    parseRawNumber(form.finalPrice) >= 0;
  return (
    <>
      <View style={styles.content}>
        <AdminField
          label="Tên gói học *"
          value={form.name}
          onChangeText={(v) => set("name", v)}
          placeholder="Nhập tên gói học..."
        />
        <View style={styles.group}>
          <View style={styles.flex}>
            <AdminField
              label="Thời lượng (tháng) *"
              value={form.durationMonths}
              onChangeText={(v) => set("durationMonths", v)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flex}>
            <AdminField
              label="Số buổi trong gói *"
              value={form.includedSessionCount}
              onChangeText={(v) => set("includedSessionCount", v)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <AdminField
          label="Giá gốc (đ)"
          value={form.basePrice}
          onChangeText={(v) => setCurrency("basePrice", v)}
          keyboardType="numeric"
        />
        <AdminField
          label="Giá bán (đ) *"
          value={form.finalPrice}
          onChangeText={(v) => setCurrency("finalPrice", v)}
          keyboardType="numeric"
        />
        <View>
          <View style={styles.chips}>
            {(["BASIC", "ADVANCED", "EXPERT"] as const).map((value) => (
              <AdminChip
                key={value}
                label={
                  {
                    BASIC: "Cơ bản",
                    ADVANCED: "Nâng cao",
                    EXPERT: "Chuyên sâu",
                  }[value]
                }
                selected={form.level === value}
                onPress={() => set("level", value)}
              />
            ))}
          </View>
        </View>
        <View style={styles.chips}>
          <AdminChip
            label="Đang bán"
            selected={form.status === "ACTIVE"}
            onPress={() => set("status", "ACTIVE")}
          />
          <AdminChip
            label="Tạm dừng"
            selected={form.status === "INACTIVE"}
            onPress={() => set("status", "INACTIVE")}
          />
        </View>
      </View>
      <View style={styles.footer}>
        <AdminButton
          label="Hủy"
          variant="secondary"
          onPress={onClose}
          style={styles.button}
        />
        <AdminButton
          label={plan ? "Lưu thay đổi" : "Tiếp tục cấu hình"}
          disabled={!valid}
          loading={submitting}
          onPress={() =>
            onSubmit({
              name: form.name.trim(),
              level: form.level,
              durationMonths: Number(form.durationMonths),
              includedSessionCount: Number(form.includedSessionCount),
              basePrice: parseRawNumber(form.basePrice),
              finalPrice: parseRawNumber(form.finalPrice),
              status: form.status,
            })
          }
          style={styles.button}
        />
      </View>
    </>
  );
}

export function TrainingPlanFormSheet({
  visible,
  plan,
  submitting,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  plan?: TrainingPlanSimpleResponse | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (request: TrainingPlanCreateRequest) => void;
}) {
  // The key changes every time the sheet opens, causing FormBody to remount
  // and reinitialize its useState — no useEffect or render-time ref needed.
  const openKey = visible ? `open-${plan?.trainingPlanId ?? "new"}` : "closed";
  return (
    <BottomSheetWindow
      visible={visible}
      title={plan ? "Chỉnh sửa gói học" : "Tạo gói học"}
      heightRatio={0.9}
      onClose={onClose}
    >
      <FormBody
        key={openKey}
        plan={plan}
        submitting={submitting}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </BottomSheetWindow>
  );
}
const styles = StyleSheet.create({
  content: { gap: 18, paddingTop: 14, paddingBottom: 18 },
  group: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  footer: { flexDirection: "row", gap: 10 },
  button: { flex: 1 },
});

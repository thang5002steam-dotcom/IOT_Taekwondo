import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { PersonCreateRequest } from "@/features/person/api/person.dto";
import { ALL_BELTS, BeltLabel, type Belt } from "@/features/person/constants/person.constants";
import { useCreatePerson } from "@/features/person/queries/personQueries";
import { usePositions } from "@/features/position/queries/positionQueries";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { AdminButton, AdminChip, AdminField } from "@/shared/ui/admin/AdministrationPrimitives";
import { useToast } from "@/shared/ui/Toast";
import { Colors } from "@/theme";

type PersonKind = "student" | "coach";

const today = () => new Date().toISOString().slice(0, 10);
const initialForm = () => ({
  fullName: "",
  birthDate: "",
  email: "",
  nationalCode: "",
  gender: true,
  currentBelt: "C10" as Belt,
});

export function PersonCreateSheet({
  kind,
  visible,
  onClose,
}: {
  kind: PersonKind;
  visible: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const createPerson = useCreatePerson();
  const positions = usePositions();
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (visible) setForm(initialForm());
  }, [visible]);

  const studentPosition = useMemo(
    () => positions.data?.content.find((position) => position.code.toUpperCase() === "STUDENT"),
    [positions.data?.content],
  );

  const title = kind === "student" ? "Tạo học viên" : "Tạo huấn luyện viên";

  const submit = async () => {
    if (!form.fullName.trim() || !form.birthDate) {
      toast.show({ message: "Vui lòng nhập họ tên và ngày sinh.", variant: "error" });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate)) {
      toast.show({ message: "Ngày sinh cần theo định dạng YYYY-MM-DD.", variant: "error" });
      return;
    }
    if (kind === "student" && !studentPosition) {
      toast.show({ message: "Chưa tìm thấy vị trí Học viên (mã STUDENT).", variant: "error" });
      return;
    }

    const request: PersonCreateRequest = {
      fullName: form.fullName.trim(),
      gender: form.gender,
      birthDate: form.birthDate,
      email: form.email.trim() || null,
      nationalCode: form.nationalCode.trim() || null,
      faceImagePath: null,
      positionId: kind === "student" ? studentPosition!.positionId : null,
      currentBelt: form.currentBelt,
      status: "ACTIVE",
      startDate: today(),
    };

    try {
      await createPerson.mutateAsync(request);
      toast.show({ message: `Đã tạo ${kind === "student" ? "học viên" : "huấn luyện viên"}.`, variant: "success" });
      onClose();
    } catch {
      toast.show({ message: `Không thể tạo ${kind === "student" ? "học viên" : "huấn luyện viên"}.`, variant: "error" });
    }
  };

  return (
    <BottomSheetWindow
      visible={visible}
      title={title}
      heightRatio={0.8}
      onClose={onClose}
      footer={<AdminButton label="Tạo mới" loading={createPerson.isPending} onPress={submit} />}
    >
      <View style={styles.content}>
        <AdminField label="Họ và tên *" value={form.fullName} onChangeText={(fullName) => setForm((value) => ({ ...value, fullName }))} placeholder="Nhập họ và tên" />
        <AdminField label="Ngày sinh *" value={form.birthDate} onChangeText={(birthDate) => setForm((value) => ({ ...value, birthDate }))} placeholder="YYYY-MM-DD" />
        <AdminField label="Email" value={form.email} onChangeText={(email) => setForm((value) => ({ ...value, email }))} placeholder="example@email.com" keyboardType="email-address" />
        <AdminField label="CCCD / CMND" value={form.nationalCode} onChangeText={(nationalCode) => setForm((value) => ({ ...value, nationalCode }))} placeholder="Nhập số giấy tờ" keyboardType="numeric" />
        <View style={styles.group}>
          <View style={styles.labelRow}><AdminChip label="Giới tính" /></View>
          <View style={styles.chips}>
            <AdminChip label="Nam" selected={form.gender} onPress={() => setForm((value) => ({ ...value, gender: true }))} />
            <AdminChip label="Nữ" selected={!form.gender} onPress={() => setForm((value) => ({ ...value, gender: false }))} />
          </View>
        </View>
        <View style={styles.group}>
          <View style={styles.labelRow}><AdminChip label="Cấp đai" /></View>
          <View style={styles.chips}>
            {ALL_BELTS.map((belt) => <AdminChip key={belt} label={BeltLabel[belt]} selected={form.currentBelt === belt} onPress={() => setForm((value) => ({ ...value, currentBelt: belt }))} />)}
          </View>
        </View>
        {kind === "student" ? <View style={styles.note}><AdminChip label="Vị trí: Học viên" tone="info" /></View> : null}
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  group: { gap: 8 },
  labelRow: { alignSelf: "flex-start" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  note: { padding: 12, borderRadius: 10, backgroundColor: Colors.light.primarySoft },
});

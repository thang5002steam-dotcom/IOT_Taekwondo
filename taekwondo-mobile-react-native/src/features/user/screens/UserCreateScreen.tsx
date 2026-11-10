import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import type { RelationshipType } from "@/features/authentication/domain/auth.types";
import { useRoles } from "@/features/roles/queries/roleQueries";
import { useCreateUser } from "../queries/userQueries";
import { relationshipLabel } from "@/features/person/domain/personViewModel";
import { usePeople } from "@/features/person/queries/personQueries";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminButton,
  AdminChip,
  AdminConfirmDialog,
  AdminField,
  AdminInfoBanner,
  AdminPickerField,
  AdminPickerSheet,
  AdminSectionHeader,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { useToast } from "@/shared/ui/Toast";

import { userRelationships } from "./userAdministrationShared";

export function UserCreateScreen() {
  const router = useRouter();
  const people = usePeople();
  const roles = useRoles();
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [personId, setPersonId] = useState<string>();
  const [relationship, setRelationship] = useState<RelationshipType>("OWNER");
  const [roleCodes, setRoleCodes] = useState<string[]>([]);
  const [personSheet, setPersonSheet] = useState(false);
  const [relationshipSheet, setRelationshipSheet] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const selectedPerson = people.data?.content.find(
    (person) => person.personId === personId,
  );

  const create = useCreateUser({
    onSuccess: async (created) => {
      toast.show({ message: "Đã tạo người dùng", variant: "success" });
      setConfirming(false);
      router.replace(`/admin/users/${created.userId}` as Href);
    },
    onError: () =>
      toast.show({
        message: "Không thể tạo người dùng. Kiểm tra hồ sơ và số điện thoại.",
        variant: "error",
      }),
  });

  const toggleRole = (code: string) =>
    setRoleCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  const valid =
    phone.trim().length >= 9 && password.length >= 6 && Boolean(personId);

  return (
    <StackScreenLayout title="Tạo người dùng" contentContainerStyle={adminStyles.screen}>
      <AdminField
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Nhập số điện thoại đăng nhập"
      />
      <AdminField
        label="Mật khẩu ban đầu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Tối thiểu 6 ký tự"
      />
      <AdminPickerField
        label="Hồ sơ"
        valueLabel={selectedPerson?.fullName}
        placeholder="Chọn một hồ sơ bắt buộc"
        onPress={() => setPersonSheet(true)}
      />
      <AdminPickerField
        label="Mối quan hệ"
        valueLabel={relationshipLabel(relationship)}
        placeholder="Chọn mối quan hệ"
        onPress={() => setRelationshipSheet(true)}
      />
      <AdminSectionHeader title="Vai trò ban đầu" />
      <View style={adminStyles.chips}>
        {(roles.data?.content ?? []).map((role) => (
          <AdminChip
            key={role.code}
            label={role.name}
            selected={roleCodes.includes(role.code)}
            onPress={() => toggleRole(role.code)}
          />
        ))}
      </View>
      <AdminInfoBanner>
        Tài khoản bắt buộc liên kết chính xác một hồ sơ khi tạo, theo hợp đồng backend hiện tại.
      </AdminInfoBanner>
      <AdminButton label="Tạo người dùng" disabled={!valid} onPress={() => setConfirming(true)} />
      <AdminButton label="Hủy" variant="secondary" onPress={() => router.back()} />
      <AdminPickerSheet
        visible={personSheet}
        title="Chọn hồ sơ"
        options={(people.data?.content ?? []).map((person) => ({
          value: person.personId,
          label: person.fullName,
          description: person.personCode ?? undefined,
        }))}
        selectedValue={personId}
        onSelect={setPersonId}
        onClose={() => setPersonSheet(false)}
      />
      <AdminPickerSheet
        visible={relationshipSheet}
        title="Chọn mối quan hệ"
        options={userRelationships.map((value) => ({
          value,
          label: relationshipLabel(value),
        }))}
        selectedValue={relationship}
        onSelect={(value) => setRelationship(value as RelationshipType)}
        onClose={() => setRelationshipSheet(false)}
      />
      <AdminConfirmDialog
        confirming={confirming}
        title="Tạo người dùng mới?"
        message={`Tài khoản ${phone} sẽ được tạo và liên kết với ${selectedPerson?.fullName ?? "hồ sơ đã chọn"}.`}
        confirmLabel="Tạo mới"
        loading={create.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          create.mutate({
            request: {
              phoneNumber: phone.trim(),
              passwordHash: password,
              personId: personId as string,
              relationshipType: relationship,
            },
            roleCodes,
          })
        }
      />
    </StackScreenLayout>
  );
}

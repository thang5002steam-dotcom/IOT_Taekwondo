import { useState } from "react";
import { View } from "react-native";

import type { RelationshipType } from "@/features/authentication/domain/auth.types";
import type { PersonSimpleResponse } from "@/features/person";
import { relationshipLabel } from "@/features/person/domain/personViewModel";
import { usePeople } from "@/features/person/queries/personQueries";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import {
  AdminButton,
  AdminChip,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminListRow,
  AdminLoadingState,
  AdminPickerField,
  AdminPickerSheet,
  AdminSectionHeader,
  adminStyles,
} from "@/shared/ui/admin/AdministrationPrimitives";
import { useToast } from "@/shared/ui/Toast";
import { LinkedPersonDetailSheet } from "../components/LinkedPersonDetailSheet";
import { Avatar, StatusChip, userAdminStyles } from "../components/UserAdministrationPrimitives";
import { useLinkUserProfile, useUser } from "../queries/userQueries";

import { userRelationships, useUserId } from "./userAdministrationShared";

export function UserProfilesScreen() {
  const userId = useUserId();
  const user = useUser(userId);
  const people = usePeople();
  const toast = useToast();

  const linked: PersonSimpleResponse[] = user.data?.persons ?? [];
  const { refreshing, onRefresh } = useScreenRefresh([user, people]);
  const [personId, setPersonId] = useState<string>();
  const [relationship, setRelationship] =
    useState<RelationshipType>("GUARDIAN");
  const [personSheet, setPersonSheet] = useState(false);
  const [relationshipSheet, setRelationshipSheet] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Selected person for detail sheet
  const [selectedPerson, setSelectedPerson] =
    useState<PersonSimpleResponse | null>(null);

  const available = (people.data?.content ?? []).filter(
    (person: PersonSimpleResponse) =>
      !linked.some((item) => item.personId === person.personId),
  );
  const newlySelectedPerson = available.find(
    (person) => person.personId === personId,
  );

  const create = useLinkUserProfile({
    onSuccess: async () => {
      toast.show({ message: "Đã liên kết hồ sơ", variant: "success" });
      setConfirming(false);
      setPersonId(undefined);
    },
    onError: () =>
      toast.show({ message: "Không thể liên kết hồ sơ", variant: "error" }),
  });

  return (
    <StackScreenLayout
      title="Hồ sơ liên kết"
      contentContainerStyle={adminStyles.screen}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <AdminSectionHeader title={`${linked.length} hồ sơ đã liên kết`} />
      {user.isPending ? (
        <AdminLoadingState />
      ) : linked.length === 0 ? (
        <AdminEmptyState message="Chưa có hồ sơ liên kết" />
      ) : (
        <View style={userAdminStyles.list}>
          {linked.map((person) => (
            <AdminListRow
              key={person.personId}
              leading={
                <Avatar
                  name={person.fullName}
                  imageUrl={person.faceImagePath}
                />
              }
              title={person.fullName}
              subtitle={person.position?.name}
              onPress={() => setSelectedPerson(person)}
              meta={
                person.status ? (
                  <AdminChip
                    label={
                      person.status === "ACTIVE"
                        ? "Hoạt động"
                        : "Ngừng hoạt động"
                    }
                    tone={person.status === "ACTIVE" ? "success" : "neutral"}
                  />
                ) : (
                  <StatusChip status={null} />
                )
              }
            />
          ))}
        </View>
      )}
      <AdminSectionHeader title="Thêm liên kết" />
      <AdminPickerField
        label="Hồ sơ"
        valueLabel={newlySelectedPerson?.fullName}
        placeholder="Chọn hồ sơ chưa liên kết"
        onPress={() => setPersonSheet(true)}
      />
      <AdminPickerField
        label="Mối quan hệ"
        valueLabel={relationshipLabel(relationship)}
        placeholder="Chọn mối quan hệ"
        onPress={() => setRelationshipSheet(true)}
      />
      <AdminButton
        label="Liên kết hồ sơ"
        disabled={!personId}
        onPress={() => setConfirming(true)}
      />
      <AdminPickerSheet
        visible={personSheet}
        title="Chọn hồ sơ"
        options={available.map((person) => ({
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
        title="Tạo liên kết hồ sơ?"
        message={`${newlySelectedPerson?.fullName ?? "Hồ sơ"} sẽ được liên kết với tài khoản theo quan hệ ${relationshipLabel(relationship).toLocaleLowerCase("vi-VN")}.`}
        confirmLabel="Tạo mới"
        loading={create.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          create.mutate({
            userId: userId as string,
            personId: personId as string,
            relationshipType: relationship,
            active: true,
          })
        }
      />

      {/* Chi tiết hồ sơ liên kết & Popover đổi chức vụ */}
      <LinkedPersonDetailSheet
        person={selectedPerson}
        userId={userId}
        onClose={() => setSelectedPerson(null)}
      />
    </StackScreenLayout>
  );
}

import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";
import {
  Camera,
  CheckListNotes,
  DocText,
  Gallery,
  People,
  Trash6,
  UserCircle,
  Wallet,
} from "reicon-react-native";

import { Permission, useCan } from "@/features/authorization";
import {
  BeltLabel,
  PersonStatusLabel,
} from "@/features/person/constants/person.constants";
import {
  useDeletePerson,
  useDeletePersonFaceEmbedding,
  usePerson,
  useUpdatePersonFaceEmbedding,
} from "@/features/person/queries/personQueries";
import type { MobileUploadFile } from "@/infrastructure/http/http.types";
import { SurfaceCard } from "@/features/student-commerce/components/StudentCommercePrimitives";
import type {
  StudentRouteProps,
  StudentSummaryView,
} from "@/features/student-commerce/types";
import {
  asHref,
  formatVnd,
} from "@/features/student-commerce/utils/studentCommerceUtils";
import { useWalletByPerson } from "@/features/wallet/queries/walletQueries";
import { useScreenRefresh } from "@/infrastructure/query/useScreenRefresh";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { useDynamicDetailTitle } from "@/routes/navigation/utils/screenTitle";
import { AppIcon } from "@/shared/ui/AppIcon";
import { CancellableLoadingOverlay } from "@/shared/ui/CancellableLoadingOverlay";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { FloatingActionBar } from "@/shared/ui/FloatingActionBar";
import { NavigationMenu, NavigationMenuItem } from "@/shared/ui/NavigationMenu";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { activeEffect, Colors, effects, figmaColors, radii, typography } from "@/theme";
import type { AppIconElement } from "@/theme/icons";
import { StudentProfileSummaryCard } from "../components/StudentProfileSummaryCard";

export function StudentDetailScreen({ studentCode }: StudentRouteProps) {
  const router = useRouter();
  const personQuery = usePerson(studentCode);
  const deletePerson = useDeletePerson();
  const canDelete = useCan(Permission.PERSON_DELETE);
  const canDirectTopUp = useCan(Permission.WALLET_TOP_UP_DIRECT_CREATE);
  const canReadUserPersons = useCan(Permission.USER_PERSON_READ);
  const canReadUsers = useCan(Permission.USER_READ);
  const canViewUserAccounts = canReadUserPersons && canReadUsers;
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false);
  const [avatarPreviewVisible, setAvatarPreviewVisible] = useState(false);
  const [isAvatarProcessing, setIsAvatarProcessing] = useState(false);
  const deleteController = useRef<AbortController | null>(null);

  const person = personQuery.data;
  const updateFaceEmbedding = useUpdatePersonFaceEmbedding();
  const deleteFaceEmbedding = useDeletePersonFaceEmbedding();
  const walletQuery = useWalletByPerson(person?.personId);
  const { refreshing, onRefresh } = useScreenRefresh([
    personQuery,
    walletQuery,
  ]);

  const student: StudentSummaryView | null = useMemo(() => {
    if (!person) return null;
    return {
      personId: person.personId,
      personCode:
        person.personCode || person.personId.substring(0, 8).toUpperCase(),
      fullName: person.fullName,
      birthDate: person.birthDate,
      beltLabel:
        BeltLabel[person.currentBelt] || person.currentBelt || "Chưa có đai",
      statusLabel:
        PersonStatusLabel[person.status] || person.status || "Đang hoạt động",
    };
  }, [person]);

  const title = useDynamicDetailTitle(student, { fallback: "Học viên" });
  const activeStudentId = student?.personId || studentCode || "";
  const avatarUrl = person?.faceImagePath;

  const handleUploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!activeStudentId) return;

    setIsAvatarProcessing(true);
    try {
      const file: MobileUploadFile = {
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };
      await updateFaceEmbedding.mutateAsync({ personId: activeStudentId, file });
      toast.show({ message: "Đã cập nhật ảnh đại diện.", variant: "success" });
    } catch {
      toast.show({ message: "Không thể cập nhật ảnh đại diện.", variant: "error" });
    } finally {
      setIsAvatarProcessing(false);
    }
  };

  const handleTakeAvatarPhoto = async () => {
    setAvatarSheetVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.show({ message: "Vui lòng cấp quyền máy ảnh để chụp ảnh đại diện.", variant: "warning" });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) await handleUploadAvatar(result.assets[0]);
  };

  const handlePickAvatarImage = async () => {
    setAvatarSheetVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show({ message: "Vui lòng cấp quyền thư viện để chọn ảnh đại diện.", variant: "warning" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) await handleUploadAvatar(result.assets[0]);
  };

  const handleDeleteAvatar = async () => {
    setAvatarSheetVisible(false);
    if (!activeStudentId) return;
    setIsAvatarProcessing(true);
    try {
      await deleteFaceEmbedding.mutateAsync(activeStudentId);
      toast.show({ message: "Đã xóa ảnh đại diện.", variant: "success" });
    } catch {
      toast.show({ message: "Không thể xóa ảnh đại diện.", variant: "error" });
    } finally {
      setIsAvatarProcessing(false);
    }
  };
  const handleDelete = async () => {
    if (!activeStudentId) return;
    setConfirmDelete(false);
    setDeleting(true);
    const controller = new AbortController();
    deleteController.current = controller;
    try {
      await deletePerson.mutateAsync({
        personId: activeStudentId,
        signal: controller.signal,
      });
      toast.show({ message: "Đã xóa học viên.", variant: "success" });
      router.replace(asHref("/students"));
    } catch (error) {
      if ((error as { name?: string }).name !== "AbortError") {
        toast.show({ message: "Không thể xóa học viên.", variant: "error" });
      }
    } finally {
      deleteController.current = null;
      setDeleting(false);
    }
  };

  if (personQuery.isLoading && !student) {
    return (
      <StackScreenLayout
        title={title}
        contentContainerStyle={[styles.content, styles.center]}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </StackScreenLayout>
    );
  }

  if (!personQuery.isLoading && !student) {
    return (
      <StackScreenLayout
        title={title}
        contentContainerStyle={[styles.content, styles.center]}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <ThemedText type="bodySmall" style={styles.blackText}>
          Không tìm thấy thông tin học viên.
        </ThemedText>
      </StackScreenLayout>
    );
  }

  return (
    <StackScreenLayout
      title={title}
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={onRefresh}
      floatingContent={
        <FloatingActionBar
          actions={[
            ...(canDirectTopUp
              ? [
                  {
                    label: "Nạp tiền",
                    accessibilityLabel: "Nạp tiền cho học viên",
                    variant: "outline" as const,
                    onPress: () =>
                      router.push(
                        asHref(`/students/${activeStudentId}/top-up`),
                      ),
                  },
                ]
              : []),
            {
              label: "Đăng ký khóa học",
              accessibilityLabel: "Đăng ký khóa học cho học viên",
              variant: "primary",
              flex: 1.3,
              onPress: () =>
                router.push(
                  asHref(`/students/${activeStudentId}/course-registration`),
                ),
            },
            ...(canDelete
              ? [
                  {
                    key: "delete",
                    label: "",
                    accessibilityLabel: "Xóa học viên",
                    variant: "ghost" as const,
                    disabled: deleting,
                    onPress: () => setConfirmDelete(true),
                    flex: 0,
                    style: {
                      width: 44,
                      minWidth: 44,
                      paddingHorizontal: 0,
                      backgroundColor: "transparent",
                      borderWidth: 0,
                    },
                    icon: (
                      <AppIcon
                        icon={<Trash6 />}
                        size={30}
                        color={
                          deleting
                            ? Colors.light.textSecondary
                            : Colors.light.error
                        }
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      {student ? (
        <StudentProfileSummaryCard
          student={student}
          avatarUrl={avatarUrl}
          onAvatarPress={() => setAvatarSheetVisible(true)}
          isAvatarUpdating={isAvatarProcessing}
        />
      ) : null}

      <SurfaceCard>
        <View style={styles.row}>
          <AppIcon icon={<Wallet />} size={24} color={Colors.light.primary} />
          <ThemedText type="bodySmall" style={styles.blackText}>
            Ví điện tử
          </ThemedText>
        </View>
        <ThemedText type="heading" style={styles.blackText}>
          {walletQuery.isLoading
            ? "Đang tải..."
            : walletQuery.data
              ? formatVnd(walletQuery.data.balance)
              : "Không có dữ liệu"}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Số dư khả dụng
        </ThemedText>
        <Pressable
          onPress={() =>
            router.push(asHref(`/students/${activeStudentId}/wallet`))
          }
        >
          <ThemedText type="action" style={styles.primaryText}>
            Xem chi tiết ví ›
          </ThemedText>
        </Pressable>
      </SurfaceCard>

      <NavigationMenu>
        <NavigationMenuItem
          icon={<DocText />}
          title="Khóa học đang học"
          count={0}
          onPress={() =>
            router.push(asHref(`/students/${activeStudentId}/courses`))
          }
        />
        <NavigationMenuItem
          icon={<CheckListNotes />}
          title="Lịch sử tập luyện"
          onPress={() => router.push(asHref("/history/student"))}
        />
        {canViewUserAccounts ? (
          <NavigationMenuItem
            icon={<People />}
            title="Tài khoản người dùng"
            onPress={() =>
              router.push(asHref(`/students/${activeStudentId}/users`))
            }
          />
        ) : null}
      </NavigationMenu>
      <ConfirmationDialog
        visible={confirmDelete}
        title="Xóa học viên"
        description={`Bạn có chắc muốn xóa học viên "${student?.fullName ?? "này"}" không? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmVariant="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
      <CancellableLoadingOverlay
        visible={deleting}
        message="Đang xóa học viên..."
        cancelLabel="Hủy"
        onCancel={() => deleteController.current?.abort()}
      />
      <BottomSheetWindow
        visible={avatarSheetVisible}
        title="Ảnh đại diện"
        onClose={() => setAvatarSheetVisible(false)}
        scrollable={false}
      >
        <View style={styles.avatarSheetOptions}>
          <AvatarSheetOption
            icon={<UserCircle weight="Filled" />}
            label="Xem ảnh đại diện"
            onPress={() => {
              setAvatarSheetVisible(false);
              setAvatarPreviewVisible(true);
            }}
          />
          <AvatarSheetOption icon={<Camera />} label="Chụp ảnh mới" onPress={handleTakeAvatarPhoto} />
          <AvatarSheetOption icon={<Gallery />} label="Tải ảnh lên từ thư viện" onPress={handlePickAvatarImage} />
          {avatarUrl ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xóa ảnh đại diện"
              onPress={handleDeleteAvatar}
              style={({ pressed }) => [styles.avatarDeleteOption, activeEffect(pressed, "pressedScale")]}
            >
              <ThemedText style={styles.avatarDeleteText}>Xóa ảnh đại diện hiện tại</ThemedText>
            </Pressable>
          ) : null}
        </View>
      </BottomSheetWindow>
      <Modal visible={avatarPreviewVisible} transparent animationType="fade" onRequestClose={() => setAvatarPreviewVisible(false)}>
        <View style={styles.avatarPreviewBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng xem ảnh"
            onPress={() => setAvatarPreviewVisible(false)}
            style={({ pressed }) => [styles.avatarPreviewClose, activeEffect(pressed)]}
          >
            <ThemedText style={styles.avatarPreviewCloseText}>Đóng</ThemedText>
          </Pressable>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarPreviewImage} contentFit="contain" />
          ) : (
            <View style={styles.avatarPreviewPlaceholder}>
              <AppIcon icon={<UserCircle weight="Filled" />} size={180} color={figmaColors.color1} />
            </View>
          )}
        </View>
      </Modal>
    </StackScreenLayout>
  );
}

function AvatarSheetOption({ icon, label, onPress }: { icon: AppIconElement; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.avatarSheetOption,
        activeEffect(pressed, "pressedScale"),
      ]}
    >
      <View style={styles.avatarOptionIcon}><AppIcon icon={icon} size={22} color={Colors.light.primary} /></View>
      <ThemedText style={styles.avatarOptionText}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 128,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  blackText: {
    color: Colors.light.text,
  },
  primaryText: {
    color: Colors.light.primary,
  },
  avatarSheetOptions: { paddingVertical: 12, gap: 10 },
  avatarSheetOption: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: radii.md, backgroundColor: Colors.light.backgroundElement },
  avatarOptionIcon: { width: 38, height: 38, marginRight: 14, borderRadius: radii.pill, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.surface, ...effects.soft },
  avatarOptionText: { ...typography.body, color: Colors.light.text },
  avatarDeleteOption: { alignItems: "center", marginTop: 4, paddingVertical: 14, borderRadius: radii.md },
  avatarDeleteText: { ...typography.body, color: Colors.light.error },
  avatarPreviewBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "rgba(0, 0, 0, 0.92)" },
  avatarPreviewClose: { position: "absolute", top: 54, right: 20, zIndex: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: "rgba(255, 255, 255, 0.2)" },
  avatarPreviewCloseText: { ...typography.bodySmall, color: Colors.light.surface },
  avatarPreviewImage: { width: 280, height: 280, borderRadius: 140, borderWidth: 3, borderColor: Colors.light.surface },
  avatarPreviewPlaceholder: { width: 280, height: 280, borderRadius: 140, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.surface },
});

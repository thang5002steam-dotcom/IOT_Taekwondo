import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";
import {
  ArrowUp,
  AwardCertificate,
  CalendarDays,
  Camera,
  ChartSuccess,
  Gallery,
  Headphones,
  Mailbox,
  Pen2,
  Phone,
  User,
  UserCircle,
  Weight,
} from "reicon-react-native";

import { useAuthSession } from "@/features/authentication";
import {
  BeltLabel,
  useDeletePersonFaceEmbedding,
  usePerson,
  useUpdatePersonFaceEmbedding,
} from "@/features/person";
import type { MobileUploadFile } from "@/infrastructure/http/http.types";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { BottomSheetWindow } from "@/shared/ui/BottomSheetWindow";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { activeEffect, Colors, effects, figmaColors, radii, typography } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

type GeneralInfoItem = {
  label: string;
  value: string;
  icon: AppIconElement;
};

function formatDisplayDate(dateStr?: string | null) {
  if (!dateStr) return "Chưa cập nhật";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return dateStr;
}

export default function GeneralInfoScreen() {
  const toast = useToast();
  const { activeContext, user } = useAuthSession();
  const personId = activeContext?.personId;

  const { data: person, isLoading: isPersonLoading } = usePerson(personId);
  const avatarUrl = person?.faceImagePath;

  const updateFaceEmbedding = useUpdatePersonFaceEmbedding();
  const deleteFaceEmbedding = useDeletePersonFaceEmbedding();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const labelName = (person?.fullName || activeContext?.displayName || "Chưa cập nhật").toLocaleUpperCase("vi-VN");

  const infoItems: GeneralInfoItem[] = [
    {
      label: "Giới tính",
      value: person?.gender === true ? "Nam" : person?.gender === false ? "Nữ" : "Chưa cập nhật",
      icon: <User />,
    },
    {
      label: "Ngày sinh",
      value: formatDisplayDate(person?.birthDate),
      icon: <CalendarDays />,
    },
    {
      label: "Email",
      value: person?.email || "Chưa cập nhật",
      icon: <Mailbox />,
    },
    {
      label: "Số điện thoại",
      value: user?.phoneNumber || "Chưa cập nhật",
      icon: <Phone />,
    },
    {
      label: "Mã định danh",
      value: person?.personCode || person?.nationalCode || "Chưa cập nhật",
      icon: <ArrowUp />,
    },
    {
      label: "Cấp độ đai",
      value: person?.currentBelt ? BeltLabel[person.currentBelt] || person.currentBelt : "Chưa cập nhật",
      icon: <AwardCertificate />,
    },
    {
      label: "Chức vụ / Vị trí",
      value: person?.position?.name || "Học viên",
      icon: <Weight />,
    },
    {
      label: "Ngày bắt đầu",
      value: formatDisplayDate(person?.startDate),
      icon: <ChartSuccess />,
    },
  ];

  const handleUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!personId) {
      toast.show({
        message: "Không tìm thấy thông tin nhân sự để cập nhật ảnh.",
        variant: "error",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const file: MobileUploadFile = {
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };
      await updateFaceEmbedding.mutateAsync({ personId, file });
      toast.show({
        message: "Cập nhật ảnh đại diện thành công.",
        variant: "success",
      });
    } catch {
      toast.show({
        message: "Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePhoto = async () => {
    setSheetVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.show({
        message: "Vui lòng cấp quyền truy cập máy ảnh để chụp ảnh đại diện.",
        variant: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUpload(result.assets[0]);
    }
  };

  const handlePickImage = async () => {
    setSheetVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show({
        message: "Vui lòng cấp quyền truy cập thư viện để chọn ảnh đại diện.",
        variant: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUpload(result.assets[0]);
    }
  };

  const handleDeletePhoto = async () => {
    setSheetVisible(false);
    if (!personId) return;

    setIsProcessing(true);
    try {
      await deleteFaceEmbedding.mutateAsync(personId);
      toast.show({
        message: "Đã xóa ảnh đại diện.",
        variant: "success",
      });
    } catch {
      toast.show({
        message: "Xóa ảnh đại diện thất bại. Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StackScreenLayout
      title="Thông tin chung"
      contentContainerStyle={styles.content}
      floatingContent={<SupportButtons />}
    >
      <View style={styles.card}>
        <Pressable
          style={({ pressed }) => [
            styles.avatarWrap,
            activeEffect(pressed, "pressedScale"),
          ]}
          onPress={() => setSheetVisible(true)}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Đổi ảnh đại diện"
        >
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <AppIcon
                icon={<UserCircle weight="Filled" />}
                size={120}
                color={figmaColors.color1}
              />
            )}
            {isProcessing ? (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={Colors.light.surface} />
              </View>
            ) : null}
          </View>
          <View style={styles.editBadge}>
            <AppIcon icon={<Pen2 />} size={15} color={Colors.light.text} />
          </View>
        </Pressable>

        <ThemedText type="title" style={styles.name}>
          {labelName}
        </ThemedText>

        <View style={styles.infoList}>
          {infoItems.map((item, index) => (
            <GeneralInfoRow
              key={item.label}
              item={item}
              showDivider={index < infoItems.length - 1}
            />
          ))}
        </View>
      </View>

      <BottomSheetWindow
        visible={sheetVisible}
        title="Ảnh đại diện"
        onClose={() => setSheetVisible(false)}
        scrollable={false}
      >
        <View style={styles.sheetOptions}>
          <Pressable
            style={({ pressed }) => [
              styles.sheetOption,
              activeEffect(pressed, "pressedScale"),
            ]}
            onPress={() => {
              setSheetVisible(false);
              setPreviewVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Xem ảnh đại diện"
          >
            <View style={styles.optionIconWrap}>
              <AppIcon
                icon={<UserCircle weight="Filled" />}
                size={22}
                color={Colors.light.primary}
              />
            </View>
            <ThemedText style={styles.optionText}>Xem ảnh đại diện</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.sheetOption,
              activeEffect(pressed, "pressedScale"),
            ]}
            onPress={handleTakePhoto}
            accessibilityRole="button"
            accessibilityLabel="Chụp ảnh mới"
          >
            <View style={styles.optionIconWrap}>
              <AppIcon icon={<Camera />} size={22} color={Colors.light.primary} />
            </View>
            <ThemedText style={styles.optionText}>Chụp ảnh mới</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.sheetOption,
              activeEffect(pressed, "pressedScale"),
            ]}
            onPress={handlePickImage}
            accessibilityRole="button"
            accessibilityLabel="Tải ảnh lên từ thư viện"
          >
            <View style={styles.optionIconWrap}>
              <AppIcon icon={<Gallery />} size={22} color={Colors.light.primary} />
            </View>
            <ThemedText style={styles.optionText}>Tải ảnh lên từ thư viện</ThemedText>
          </Pressable>

          {avatarUrl ? (
            <Pressable
              style={({ pressed }) => [
                styles.sheetOption,
                styles.sheetOptionDelete,
                activeEffect(pressed, "pressedScale"),
              ]}
              onPress={handleDeletePhoto}
              accessibilityRole="button"
              accessibilityLabel="Xóa ảnh đại diện"
            >
              <ThemedText style={styles.optionTextDelete}>
                Xóa ảnh đại diện hiện tại
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </BottomSheetWindow>

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewBackdrop}>
          <Pressable
            style={({ pressed }) => [
              styles.previewCloseButton,
              activeEffect(pressed),
            ]}
            onPress={() => setPreviewVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Đóng xem ảnh"
          >
            <ThemedText style={styles.previewCloseText}>Đóng</ThemedText>
          </Pressable>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.previewImage}
              contentFit="contain"
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <AppIcon
                icon={<UserCircle weight="Filled" />}
                size={180}
                color={figmaColors.color1}
              />
            </View>
          )}
        </View>
      </Modal>
    </StackScreenLayout>
  );
}

function GeneralInfoRow({
  item,
  showDivider,
}: {
  item: GeneralInfoItem;
  showDivider: boolean;
}) {
  return (
    <View style={[styles.infoRow, !showDivider ? styles.infoRowLast : null]}>
      <AppIcon
        icon={item.icon}
        color={figmaColors.color1}
        size={30}
        style={styles.infoIcon}
      />
      <View style={styles.infoCopy}>
        <ThemedText type="bodySmall" style={styles.infoLabel}>
          {item.label}
        </ThemedText>
        <ThemedText type="body" style={styles.infoValue}>
          {item.value}
        </ThemedText>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

function SupportButtons() {
  return (
    <View pointerEvents="box-none" style={styles.supportButtons}>
      <View style={styles.supportButton}>
        <AppIcon
          icon={<Headphones weight="Filled" />}
          size={35}
          color={Colors.light.accent}
        />
      </View>
      <Image
        source={require("@/assets/images/zalo-support.png")}
        style={styles.zaloButton}
        contentFit="cover"
        accessibilityLabel="Zalo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    paddingTop: 66,
    overflow: "visible",
    ...effects.soft,
  },
  avatarWrap: {
    position: "absolute",
    top: -50,
    alignSelf: "center",
    width: 110,
    height: 110,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    ...effects.card,
  },
  name: {
    marginTop: 10,
    color: Colors.light.text,
    textAlign: "center",
    ...typography.title,
  },
  infoList: {
    paddingHorizontal: 14,
    marginTop: 13,
    marginBottom: 23,
  },
  infoRow: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 2,
  },
  infoRowLast: {
    height: 55,
  },
  infoIcon: {
    marginTop: 7,
  },
  infoCopy: {
    flex: 1,
    marginLeft: 20,
  },
  infoLabel: {
    color: Colors.light.divider,
  },
  infoValue: {
    marginTop: 1,
    color: Colors.light.text,
  },
  divider: {
    position: "absolute",
    left: 0,
    right: 2,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
  sheetOptions: {
    paddingVertical: 12,
    gap: 10,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: Colors.light.backgroundElement,
  },
  optionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    ...effects.soft,
  },
  optionText: {
    ...typography.body,
    color: Colors.light.text,
  },
  sheetOptionDelete: {
    backgroundColor: "transparent",
    justifyContent: "center",
    marginTop: 4,
  },
  optionTextDelete: {
    ...typography.body,
    color: Colors.light.error,
  },
  supportButtons: {
    position: "absolute",
    right: 31,
    bottom: 64,
    gap: 12,
  },
  supportButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
    ...effects.card,
  },
  zaloButton: {
    width: 56,
    height: 55,
    borderRadius: 10,
    ...effects.card,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  previewCloseButton: {
    position: "absolute",
    top: 54,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 10,
  },
  previewCloseText: {
    color: Colors.light.surface,
    ...typography.bodySmall,
  },
  previewImage: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: Colors.light.surface,
  },
  previewPlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});


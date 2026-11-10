import { useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { Permission, useCan } from "@/features/authorization";
import { selectCurrentPersonId, selectCurrentUserId, useAuthStore } from "@/features/authentication/store/auth.store";
import StackScreenLayout from "@/routes/navigation/layouts/StackScreenLayout";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useToast } from "@/shared/ui/Toast";
import { Colors } from "@/theme";
import { StudentProfileSummaryCard } from "@/features/student/components/StudentProfileSummaryCard";

import {
  BalanceCard,
  FormField,
  PrimaryActionButton,
  SurfaceCard,
} from "@/features/student-commerce/components/StudentCommercePrimitives";
import { BeltLabel, PersonStatusLabel } from "@/features/person/constants/person.constants";
import { usePerson } from "@/features/person/queries/personQueries";
import type { StudentRouteProps, StudentSummaryView } from "@/features/student-commerce/types";
import { asHref } from "@/features/student-commerce/utils/studentCommerceUtils";
import { getApiErrorCode, getApiErrorMessage, getHttpErrorStatus } from "@/infrastructure/http/httpError";
import type { MobileUploadFile } from "@/infrastructure/http/http.types";
import { formatNumberWithCommas, formatVnd, parseRawNumber } from "@/shared/utils/currency";
import type { WalletTopUpMode, WalletTopUpRequestResponse } from "../api/wallet-top-up-request.dto";
import { useMyTopUpRequests, useSubmitTopUpRequest } from "../queries/walletTopUpRequestQueries";
import { useWalletByPerson } from "../queries/walletQueries";

const MAX_TOP_UP = 100_000_000;
const MAX_PROOF_BYTES = 5 * 1024 * 1024;

type TopUpScreenProps = StudentRouteProps & { mode?: WalletTopUpMode };

const statusLabel: Record<WalletTopUpRequestResponse["status"], string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ đối soát",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

export function TopUpScreen({ studentCode, mode = "GUARDIAN_REQUEST" }: TopUpScreenProps) {
  const router = useRouter();
  const toast = useToast();
  const currentUserId = useAuthStore(selectCurrentUserId);
  const activePersonId = useAuthStore(selectCurrentPersonId);
  const targetPersonId = studentCode ?? activePersonId ?? undefined;
  const isDirect = mode === "STAFF_DIRECT";
  const canCreate = useCan(isDirect ? Permission.WALLET_TOP_UP_DIRECT_CREATE : Permission.WALLET_TOP_UP_REQUEST_CREATE);
  const canReview = useCan(Permission.WALLET_TOP_UP_REVIEW);
  const permittedPersonId = canCreate ? targetPersonId : undefined;
  const personQuery = usePerson(permittedPersonId);
  const walletQuery = useWalletByPerson(permittedPersonId);
  const myRequests = useMyTopUpRequests(!isDirect && canCreate);
  const submitTopUp = useSubmitTopUpRequest();
  const [amountInput, setAmountInput] = useState("");
  const [note, setNote] = useState("");
  const [transferImage, setTransferImage] = useState<ImagePicker.ImagePickerAsset>();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [lastResult, setLastResult] = useState<WalletTopUpRequestResponse | null>(null);
  const student = useMemo<StudentSummaryView | null>(() => {
    const person = personQuery.data;
    if (!person) return null;
    return {
      personId: person.personId,
      personCode: person.personCode || person.personId.substring(0, 8).toUpperCase(),
      fullName: person.fullName,
      birthDate: person.birthDate,
      beltLabel: BeltLabel[person.currentBelt] || person.currentBelt || "Chưa có đai",
      statusLabel: PersonStatusLabel[person.status] || person.status || "Đang hoạt động",
    };
  }, [personQuery.data]);
  const balance = walletQuery.data?.balance ?? 0;
  const amount = parseRawNumber(amountInput);
  const isLoading = personQuery.isLoading || walletQuery.isLoading;
  const hasLoadError = personQuery.isError || walletQuery.isError;
  const latestRequest = useMemo(
    () => myRequests.data?.content.find((request) => request.personId === targetPersonId) ?? lastResult,
    [lastResult, myRequests.data?.content, targetPersonId],
  );

  const pickTransferImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show({ message: "Vui lòng cấp quyền thư viện để chọn ảnh chuyển khoản.", variant: "warning" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;
    if (asset.fileSize && asset.fileSize > MAX_PROOF_BYTES) {
      toast.show({ message: "Ảnh chứng từ không được vượt quá 5 MB.", variant: "warning" });
      return;
    }
    if (asset.mimeType && asset.mimeType !== "image/jpeg" && asset.mimeType !== "image/png") {
      toast.show({ message: "Chỉ chấp nhận ảnh JPG hoặc PNG.", variant: "warning" });
      return;
    }
    setTransferImage(asset);
  };

  const submit = async () => {
    if (!student || !currentUserId || !transferImage || amount <= 0 || amount > MAX_TOP_UP) return;
    const mimeType = transferImage.mimeType === "image/png" ? "image/png" : "image/jpeg";
    const proof: MobileUploadFile = {
      uri: transferImage.uri,
      name: transferImage.fileName || `chung-tu.${mimeType === "image/png" ? "png" : "jpg"}`,
      type: mimeType,
    };
    try {
      const result = await submitTopUp.mutateAsync({
        userId: currentUserId,
        personId: student.personId,
        mode,
        amount,
        note: note.trim(),
        proof,
      });
      setLastResult(result);
      toast.show({
        message: result.status === "APPROVED"
          ? "Đã nạp tiền vào ví học viên."
          : "Đã gửi yêu cầu nạp tiền để đối soát.",
        variant: "success",
      });
      setAmountInput("");
      setNote("");
      setTransferImage(undefined);
    } catch (error) {
      const status = getHttpErrorStatus(error);
      const errorCode = getApiErrorCode(error);
      const proofUploadFailed = errorCode === "SUPABASE_STORAGE_UPLOAD_FAILED"
        || errorCode === "SUPABASE_STORAGE_UNAVAILABLE"
        || errorCode === "SUPABASE_STORAGE_NOT_CONFIGURED";
      toast.show({
        message: proofUploadFailed
          ? "Không thể tải ảnh chứng từ lên hệ thống. Yêu cầu đang ở bản nháp, chưa cộng tiền vào ví. Vui lòng thử lại."
          : status === null
          ? "Chưa xác định được kết quả. Yêu cầu đã được lưu để kiểm tra và thử lại cùng mã."
          : getApiErrorMessage(error, "Không thể gửi yêu cầu nạp tiền."),
        variant: proofUploadFailed || status === null ? "warning" : "error",
      });
    } finally {
      setConfirmVisible(false);
    }
  };

  if (!canCreate) {
    return (
      <StackScreenLayout title="Nạp tiền" contentContainerStyle={styles.center}>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Bạn không có quyền thực hiện tính năng nạp tiền.
        </ThemedText>
      </StackScreenLayout>
    );
  }

  if (isLoading) {
    return (
      <StackScreenLayout title="Nạp tiền" contentContainerStyle={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </StackScreenLayout>
    );
  }

  if (hasLoadError || !student || !walletQuery.data) {
    return (
      <StackScreenLayout title="Nạp tiền" contentContainerStyle={styles.center}>
        <ThemedText type="bodySmall" style={styles.blackText}>
          Không thể tải thông tin ví học viên.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tải lại thông tin ví"
          onPress={() => {
            void personQuery.refetch();
            void walletQuery.refetch();
          }}
        >
          <ThemedText type="action" style={styles.primaryText}>
            Thử lại
          </ThemedText>
        </Pressable>
      </StackScreenLayout>
    );
  }

  return (
    <StackScreenLayout title="Nạp tiền" contentContainerStyle={styles.content}>
      <StudentProfileSummaryCard student={student} />
      <BalanceCard label="Số dư hiện tại" amount={balance} />
      <FormField
        label="Số tiền"
        value={formatNumberWithCommas(amountInput)}
        placeholder="Nhập số tiền, ví dụ: 2,000,000"
        keyboardType="numeric"
        helper={isDirect
          ? "Chỉ xác nhận sau khi đã đối soát tiền thực nhận"
          : "Số dư chỉ tăng sau khi nhân viên tài chính đối soát và duyệt"}
        onChangeText={(value) => {
          const digits = value.replace(/\D/g, "");
          setAmountInput(digits ? String(Math.min(Number(digits), MAX_TOP_UP)) : "");
        }}
      />
      <FormField
        label="Ghi chú"
        value={note}
        placeholder="Ví dụ: PH chuyển khoản qua Zalo"
        maxLength={500}
        onChangeText={setNote}
      />
      <SurfaceCard soft style={styles.uploadBox}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thêm ảnh chuyển khoản"
          onPress={() => void pickTransferImage()}
          style={({ pressed }) => [styles.uploadAction, pressed ? styles.pressed : null]}
        >
          {transferImage ? (
            <>
              <Image source={{ uri: transferImage.uri }} contentFit="cover" style={styles.transferImage} />
              <ThemedText type="bodySmall" numberOfLines={1} style={styles.primaryText}>
                {transferImage.fileName || "Đã thêm ảnh chuyển khoản"}
              </ThemedText>
            </>
          ) : (
            <ThemedText type="bodySmall" style={styles.primaryText}>
              ＋ Thêm ảnh chuyển khoản
            </ThemedText>
          )}
        </Pressable>
      </SurfaceCard>
      <ThemedText type="bodySmall" style={styles.secondaryText}>JPG / PNG · tối đa 5 MB · bắt buộc</ThemedText>
      <BalanceCard label={isDirect ? "Số dư sau giao dịch" : "Số dư dự kiến sau khi duyệt"} amount={balance + amount} />
      <PrimaryActionButton
        title={isDirect ? "Xác nhận nạp tiền" : "Gửi yêu cầu nạp tiền"}
        loading={submitTopUp.isPending}
        disabled={!amount || amount > MAX_TOP_UP || !transferImage || !currentUserId}
        onPress={() => setConfirmVisible(true)}
      />
      <ThemedText type="bodySmall" style={styles.blackText}>
        {isDirect
          ? "Giao dịch TOP_UP / CREDIT chỉ được tạo sau xác nhận đối soát."
          : "Ảnh chứng từ không tự xác nhận tiền đã vào tài khoản. Nhân viên tài chính sẽ kiểm tra trước khi duyệt."}
      </ThemedText>
      {!isDirect && latestRequest ? (
        <SurfaceCard soft>
          <ThemedText type="title" style={styles.blackText}>Yêu cầu gần nhất</ThemedText>
          <View style={styles.statusRow}>
            <ThemedText type="bodySmall" style={styles.secondaryText}>{formatVnd(latestRequest.amount)}</ThemedText>
            <ThemedText type="bodySmall" style={styles.primaryText}>{statusLabel[latestRequest.status]}</ThemedText>
          </View>
          {latestRequest.rejectionReason ? (
            <ThemedText type="bodySmall" style={styles.errorText}>{latestRequest.rejectionReason}</ThemedText>
          ) : null}
        </SurfaceCard>
      ) : null}
      {isDirect && canReview ? (
        <PrimaryActionButton
          title="Xem yêu cầu chờ duyệt"
          variant="outline"
          onPress={() => router.push(asHref("/wallet/top-up-requests"))}
        />
      ) : null}
      <ConfirmationDialog
        visible={confirmVisible}
        title={isDirect ? "Xác nhận đã đối soát" : "Gửi yêu cầu nạp tiền"}
        description={isDirect
          ? `Xác nhận đã nhận ${formatVnd(amount)} và cộng tiền vào ví ${student.fullName}.`
          : `Gửi chứng từ ${formatVnd(amount)} để nhân viên tài chính đối soát. Số dư chưa thay đổi ở bước này.`}
        confirmLabel={isDirect ? "Đã đối soát" : "Gửi yêu cầu"}
        pending={submitTopUp.isPending}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => void submit()}
      />
    </StackScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  center: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  uploadBox: {
    minHeight: 96,
    padding: 0,
    overflow: "hidden",
  },
  uploadAction: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  transferImage: {
    width: 72,
    height: 48,
    borderRadius: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  primaryText: {
    color: Colors.light.primary,
  },
  secondaryText: {
    color: Colors.light.textSecondary,
  },
  blackText: {
    color: Colors.light.text,
  },
  errorText: {
    color: Colors.light.error,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});

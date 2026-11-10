import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";

import { faceCheckInApi } from "../services/faceCheckInApi";
import type {
  CheckInFailure,
  CheckInRecord,
} from "../types/faceScanner.types";
import type { FaceCheckInSessionStatus } from "../types/camera.types";

const POLL_INTERVAL_MS = 750;
const POLL_TIMEOUT_MS = 8000;

export function useFaceCheckInSession() {
  const [status, setStatus] = useState<FaceCheckInSessionStatus>("idle");
  const [currentResult, setCurrentResult] = useState<CheckInRecord | null>(null);
  const [currentFailure, setCurrentFailure] = useState<CheckInFailure | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<CheckInRecord[]>([]);
  const [isResultSheetVisible, setIsResultSheetVisible] = useState(false);
  const [isHistorySheetVisible, setIsHistorySheetVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);

  const isMountedRef = useRef(true);
  const activePollRequestIdRef = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCommandRef = useRef<((requestId: string) => Promise<void>) | null>(null);

  const stopPolling = useCallback(() => {
    activePollRequestIdRef.current = null;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (pollTimeoutTimerRef.current) {
      clearTimeout(pollTimeoutTimerRef.current);
      pollTimeoutTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  const pollCommand = useCallback(
    async (requestId: string) => {
      if (!isMountedRef.current || activePollRequestIdRef.current !== requestId) {
        return;
      }

      try {
        const pollResult = await faceCheckInApi.getAttendanceCommand(requestId);

        if (!isMountedRef.current || activePollRequestIdRef.current !== requestId) {
          return;
        }

        if (pollResult.status === "SUCCEEDED") {
          stopPolling();
          setIsPending(false);

          if (pollResult.record) {
            setCurrentResult(pollResult.record);
            setCurrentFailure(null);
            setSessionHistory((previous) => [pollResult.record!, ...previous]);
            setStatus("result");
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
          } else if (pollResult.failure) {
            setCurrentFailure(pollResult.failure);
            setErrorMessage(pollResult.failure.message);
            setStatus("error");
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            ).catch(() => {});
          }
          return;
        }

        if (
          pollResult.status === "REJECTED" ||
          pollResult.status === "FAILED" ||
          pollResult.status === "EXPIRED"
        ) {
          stopPolling();
          setIsPending(false);
          const failure = pollResult.failure ?? {
            errorType: "UNKNOWN" as const,
            title: "Điểm danh thất bại",
            message:
              pollResult.errorMessage ?? "Không thể hoàn tất điểm danh.",
            ctaLabel: "Quét lại",
          };

          setCurrentResult(pollResult.record ?? null);
          setCurrentFailure(failure);
          setErrorMessage(failure.message);
          setStatus("error");
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          ).catch(() => {});
          return;
        }

        pollTimerRef.current = setTimeout(() => {
          void pollCommandRef.current?.(requestId);
        }, POLL_INTERVAL_MS);
      } catch (error) {
        if (!isMountedRef.current || activePollRequestIdRef.current !== requestId) {
          return;
        }
        console.warn("[FaceCheckIn] Lỗi polling, sẽ thử lại:", error);
        pollTimerRef.current = setTimeout(() => {
          void pollCommandRef.current?.(requestId);
        }, POLL_INTERVAL_MS);
      }
    },
    [stopPolling],
  );

  useEffect(() => {
    pollCommandRef.current = pollCommand;
  }, [pollCommand]);

  const startPolling = useCallback(
    (requestId: string) => {
      stopPolling();
      activePollRequestIdRef.current = requestId;

      pollTimeoutTimerRef.current = setTimeout(() => {
        if (activePollRequestIdRef.current !== requestId || !isMountedRef.current) {
          return;
        }

        stopPolling();
        setIsPending(false);
        const failure: CheckInFailure = {
          errorType: "UNKNOWN",
          title: "Xử lý quá thời gian",
          message:
            "Hệ thống xử lý lâu, vui lòng thử lại hoặc kiểm tra lịch sử điểm danh.",
          ctaLabel: "Quét lại",
        };
        setCurrentFailure(failure);
        setErrorMessage(failure.message);
        setStatus("error");
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
      }, POLL_TIMEOUT_MS);

      pollTimerRef.current = setTimeout(() => {
        void pollCommandRef.current?.(requestId);
      }, POLL_INTERVAL_MS);
    },
    [stopPolling],
  );

  const submitPhoto = useCallback(
    async (photoFilePath: string) => {
      setErrorMessage(null);
      setStatus("submitting");

      try {
        const result = await faceCheckInApi.submitFaceCheckIn(photoFilePath);
        if (!isMountedRef.current) return;

        if (result.isPending && result.requestId) {
          setIsPending(true);
          setCurrentResult(result.record ?? null);
          setCurrentFailure(null);
          setStatus("processing");
          setIsResultSheetVisible(true);
          startPolling(result.requestId);
          return;
        }

        if (result.success && result.record) {
          setIsPending(false);
          setCurrentResult(result.record);
          setCurrentFailure(null);
          setSessionHistory((previous) => [result.record!, ...previous]);
          setStatus("result");
          setIsResultSheetVisible(true);
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => {});
          return;
        }

        const failure = result.failure ?? {
          errorType: result.errorType ?? ("UNKNOWN" as const),
          title: "Điểm danh thất bại",
          message:
            result.errorMessage ??
            "Không nhận diện được khuôn mặt. Vui lòng thử lại.",
          ctaLabel: "Thử lại",
        };
        setIsPending(false);
        setCurrentResult(result.record ?? null);
        setCurrentFailure(failure);
        setErrorMessage(failure.message);
        setStatus("error");
        setIsResultSheetVisible(true);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error("[FaceCheckIn] Lỗi khi gửi ảnh điểm danh:", error);
        const failure: CheckInFailure = {
          errorType: "UNKNOWN",
          title: "Điểm danh thất bại",
          message: "Đã xảy ra lỗi khi gửi dữ liệu điểm danh.",
          ctaLabel: "Thử lại",
        };
        setIsPending(false);
        setCurrentResult(null);
        setCurrentFailure(failure);
        setErrorMessage(failure.message);
        setStatus("error");
        setIsResultSheetVisible(true);
      }
    },
    [startPolling],
  );

  const resetSessionView = useCallback(() => {
    stopPolling();
    setIsPending(false);
    setIsResultSheetVisible(false);
    setCurrentResult(null);
    setCurrentFailure(null);
    setErrorMessage(null);
    setStatus("idle");
    setResetToken((value) => value + 1);
  }, [stopPolling]);

  const closeResultSheet = useCallback(() => {
    stopPolling();
    setIsPending(false);
    setIsResultSheetVisible(false);
    setCurrentFailure(null);
    setErrorMessage(null);
    setStatus("idle");
    setResetToken((value) => value + 1);
  }, [stopPolling]);

  const openHistorySheet = useCallback(() => setIsHistorySheetVisible(true), []);
  const closeHistorySheet = useCallback(() => setIsHistorySheetVisible(false), []);

  return {
    status,
    currentResult,
    currentFailure,
    isPending,
    sessionHistory,
    isResultSheetVisible,
    isHistorySheetVisible,
    errorMessage,
    resetToken,
    submitPhoto,
    handleNextScan: resetSessionView,
    closeResultSheet,
    cancelCheckIn: resetSessionView,
    openHistorySheet,
    closeHistorySheet,
  };
}

import { useCameraPermissions } from "expo-camera";
import { useCallback, useRef, useState } from "react";
import { Linking } from "react-native";
import type { CameraFacing } from "../types/checkIn.types";

export function useCheckInCamera() {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>("front");
  const [torch, setTorch] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isOpeningSettings, setIsOpeningSettings] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const isRequestingRef = useRef(false);
  const isOpeningSettingsRef = useRef(false);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => {
      const next = prev === "front" ? "back" : "front";
      if (next === "front") {
        setTorch(false);
      }
      return next;
    });
  }, []);

  const toggleTorch = useCallback(() => {
    if (facing === "front") {
      return;
    }
    setTorch((prev) => !prev);
  }, [facing]);

  const requestCameraPermission = useCallback(async () => {
    if (isRequestingRef.current) {
      return permission;
    }

    isRequestingRef.current = true;
    setIsRequesting(true);
    setPermissionError(null);
    setSettingsError(null);

    try {
      return await requestPermission();
    } catch {
      setPermissionError("Không thể xin quyền Camera. Vui lòng thử lại.");
      return permission;
    } finally {
      isRequestingRef.current = false;
      setIsRequesting(false);
    }
  }, [permission, requestPermission]);

  const refreshPermission = useCallback(async () => {
    setPermissionError(null);
    setSettingsError(null);

    try {
      return await getPermission();
    } catch {
      setPermissionError("Không thể kiểm tra quyền Camera. Vui lòng thử lại.");
      return null;
    }
  }, [getPermission]);

  const openCameraSettings = useCallback(async () => {
    if (isOpeningSettingsRef.current) {
      return;
    }

    isOpeningSettingsRef.current = true;
    setSettingsError(null);
    setPermissionError(null);
    setIsOpeningSettings(true);

    try {
      await Linking.openSettings();
    } catch {
      setSettingsError(
        "Không thể mở Cài đặt. Vui lòng bật quyền Camera trong phần Cài đặt của hệ thống.",
      );
    } finally {
      isOpeningSettingsRef.current = false;
      setIsOpeningSettings(false);
    }
  }, []);

  const isPermissionLoading = permission === null;
  const isPermissionGranted = Boolean(permission?.granted);
  const isPermissionDenied = Boolean(permission && !permission.granted);
  const canAskAgain = permission?.canAskAgain ?? true;
  const isPermissionUndetermined = permission?.status === "undetermined";

  const handlePermissionAction = useCallback(async () => {
    if (!canAskAgain) {
      await openCameraSettings();
      return null;
    }

    return requestCameraPermission();
  }, [canAskAgain, openCameraSettings, requestCameraPermission]);

  return {
    permission,
    requestPermission: requestCameraPermission,
    handlePermissionAction,
    refreshPermission,
    isPermissionLoading,
    isPermissionGranted,
    isPermissionDenied,
    isPermissionUndetermined,
    canAskAgain,
    isRequestingPermission: isRequesting,
    isPermissionActionPending: isRequesting || isOpeningSettings,
    permissionError: permissionError || settingsError,
    facing,
    torch,
    isTorchAvailable: facing === "back",
    toggleFacing,
    toggleTorch,
  };
}

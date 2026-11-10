import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";

import { Colors, activeEffect, radii } from "@/theme";
import { ThemedText } from "./ThemedText";

type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  confirmVariant?: "primary" | "danger";
  actionOrder?: "cancel-confirm" | "confirm-cancel";
  presentation?: "modal" | "inline";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = "Hủy",
  pending = false,
  confirmVariant = "primary",
  actionOrder = "cancel-confirm",
  presentation = "modal",
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const confirmColor =
    confirmVariant === "danger" ? Colors.light.error : Colors.light.primary;

  const cancelAction = (
    <Pressable
      key="cancel"
      accessibilityRole="button"
      accessibilityState={{ disabled: pending }}
      disabled={pending}
      onPress={onCancel}
      style={({ pressed }) => [
        styles.modalCancel,
        activeEffect(pressed, "pressed"),
      ]}
    >
      <ThemedText type="action" style={styles.modalCancelText}>
        {cancelLabel}
      </ThemedText>
    </Pressable>
  );

  const confirmAction = (
    <Pressable
      key="confirm"
      accessibilityRole="button"
      accessibilityState={{ busy: pending, disabled: pending }}
      disabled={pending}
      onPress={onConfirm}
      style={({ pressed }) => [
        styles.modalConfirm,
        { backgroundColor: confirmColor },
        activeEffect(pressed, "pressed"),
      ]}
    >
      {pending ? (
        <ActivityIndicator color={Colors.light.surface} />
      ) : (
        <ThemedText type="action" style={styles.modalConfirmText}>
          {confirmLabel}
        </ThemedText>
      )}
    </Pressable>
  );

  const actions =
    actionOrder === "confirm-cancel"
      ? [confirmAction, cancelAction]
      : [cancelAction, confirmAction];

  const content = (
    <View
      testID={presentation === "inline" ? "confirmation-dialog" : undefined}
      style={styles.modalOverlay}
      pointerEvents="auto"
    >
      <Pressable
        testID="confirmation-dialog-backdrop"
        style={StyleSheet.absoluteFill}
        onPress={pending ? undefined : onCancel}
      />
      <View
        style={styles.modalCard}
        accessibilityViewIsModal
        accessibilityRole="alert"
      >
        <ThemedText type="title" style={styles.modalTitle}>
          {title}
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.modalDescription}>
          {description}
        </ThemedText>
        <View style={styles.modalActions}>{actions}</View>
      </View>
    </View>
  );

  if (presentation === "inline") {
    return visible ? content : null;
  }

  return (
    <Modal
      testID="confirmation-dialog"
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 23, 0.54)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    color: Colors.light.text,
  },
  modalDescription: {
    color: Colors.light.textSecondary,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  modalCancel: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: Colors.light.text,
  },
  modalConfirm: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    color: Colors.light.surface,
  },
});

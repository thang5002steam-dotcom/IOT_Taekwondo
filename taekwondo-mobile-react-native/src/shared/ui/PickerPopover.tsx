import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { Plus } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, activeEffect, effects, radii } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

export interface PickerPopoverOption<T = string> {
  value: T;
  label: string;
  subtitle?: string;
  icon?: AppIconElement;
  bg?: string;
  text?: string;
  border?: string;
}

export interface PickerPopoverProps<T = string> {
  visible: boolean;
  title: string;
  subtitle?: string;
  options?: PickerPopoverOption<T>[];
  selectedValue?: T | null;
  selectedValues?: T[];
  onSelect?: (value: T) => void;
  onClose: () => void;
  useModal?: boolean;
  multiple?: boolean;
  onConfirm?: (values: T[]) => void;
  confirmLabel?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  showCloseButton?: boolean;
}

export function PickerPopover<T = string>({
  visible,
  title,
  subtitle,
  options,
  selectedValue,
  selectedValues,
  onSelect,
  onClose,
  useModal = true,
  multiple = false,
  onConfirm,
  confirmLabel = "Chọn",
  footer,
  children,
  cardStyle,
  contentContainerStyle,
  accessibilityLabel,
  showCloseButton = true,
}: PickerPopoverProps<T>) {
  const { height } = useWindowDimensions();
  if (!visible) return null;

  const dynamicCardStyle = {
    maxHeight: Math.min(Math.round(height * 0.8), 580),
  };

  const content = (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback>
          <View
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityViewIsModal
            style={[styles.popoverCard, dynamicCardStyle, cardStyle]}
          >
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                {subtitle ? (
                  <ThemedText type="caption" style={styles.headerSubtitle}>
                    {subtitle.toUpperCase()}
                  </ThemedText>
                ) : null}
                <ThemedText
                  type="subtitle"
                  numberOfLines={1}
                  style={styles.headerTitle}
                >
                  {title}
                </ThemedText>
              </View>
              {showCloseButton ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Đóng"
                  hitSlop={8}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    activeEffect(pressed, "pressedScale"),
                  ]}
                >
                  <AppIcon
                    icon={<Plus />}
                    size={16}
                    color={Colors.light.textSecondary}
                  />
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.optionsList, contentContainerStyle]}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {children ??
                options?.map((option, idx) => {
                  const isSelected = multiple
                    ? (selectedValues ?? []).includes(option.value)
                    : selectedValue === option.value;
                  const itemBg =
                    option.bg ??
                    (isSelected
                      ? Colors.light.primarySoft
                      : Colors.light.backgroundElement);
                  const itemText =
                    option.text ??
                    (isSelected ? Colors.light.primary : Colors.light.text);
                  const itemBorder =
                    option.border ??
                    (isSelected ? Colors.light.primary : Colors.light.divider);

                  return (
                    <Pressable
                      key={String(option.value ?? idx)}
                      accessibilityRole={multiple ? "checkbox" : "button"}
                      accessibilityLabel={option.label}
                      accessibilityState={{
                        selected: isSelected,
                        checked: multiple ? isSelected : undefined,
                      }}
                      onPress={() => {
                        onSelect?.(option.value);
                        if (!multiple) {
                          onClose();
                        }
                      }}
                      style={({ pressed }) => [
                        styles.optionItem,
                        { backgroundColor: itemBg, borderColor: itemBorder },
                        isSelected ? styles.optionItemSelected : null,
                        activeEffect(pressed, "pressedScale"),
                      ]}
                    >
                      <View style={styles.optionLeft}>
                        {option.icon ? (
                          <AppIcon icon={option.icon} size={16} color={itemText} />
                        ) : null}
                        <View style={styles.optionTextContainer}>
                          <ThemedText
                            type="body"
                            style={[styles.optionText, { color: itemText }]}
                          >
                            {option.label}
                          </ThemedText>
                          {option.subtitle ? (
                            <ThemedText
                              type="caption"
                              style={[
                                styles.optionSubtext,
                                { color: Colors.light.textSecondary },
                              ]}
                            >
                              {option.subtitle}
                            </ThemedText>
                          ) : null}
                        </View>
                      </View>
                      {isSelected ? (
                        <View
                          style={[styles.checkDot, { backgroundColor: itemText }]}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
            </ScrollView>

            {footer ? (
              <View style={styles.footer}>{footer}</View>
            ) : multiple && onConfirm ? (
              <View style={styles.footer}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={confirmLabel}
                  onPress={() => onConfirm(selectedValues ?? [])}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    activeEffect(pressed, "pressedScale"),
                  ]}
                >
                  <ThemedText type="action" style={styles.confirmButtonText}>
                    {confirmLabel}
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  if (useModal) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        {content}
      </Modal>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlayWrapper]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  popoverCard: {
    width: "100%",
    maxWidth: 360,
    maxHeight: 560,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: 20,
    ...effects.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.divider,
    paddingBottom: 10,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundElement,
    transform: [{ rotate: "45deg" }],
  },
  headerSubtitle: {
    color: Colors.light.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    color: Colors.light.text,
    fontSize: 17,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.divider,
  },
  confirmButton: {
    minHeight: 46,
    backgroundColor: Colors.light.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    color: Colors.light.surface,
    fontWeight: "700",
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  optionItemSelected: {
    borderWidth: 2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontWeight: "600",
    fontSize: 15,
  },
  optionSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

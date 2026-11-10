import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ban, Lock } from 'lucide-react-native';
import { Check, DocText, Play } from 'reicon-react-native';

import type { CourseResponse } from '@/features/course/api/course.dto';
import {
  type CourseLevel,
  CourseLevelLabel,
  CourseLevelValues,
  type CourseStatus,
  CourseStatusLabel,
  CourseStatusValues,
} from '@/features/course/constants/course.constants';
import { getApiErrorMessage } from '@/infrastructure/http/httpError';
import {
  AdminButton,
  AdminChip,
  AdminField,
} from '@/shared/ui/admin/AdministrationPrimitives';
import { AppIcon } from '@/shared/ui/AppIcon';
import { BottomSheetWindow } from '@/shared/ui/BottomSheetWindow';
import { CancellableLoadingOverlay } from '@/shared/ui/CancellableLoadingOverlay';
import { ThemedText } from '@/shared/ui/ThemedText';
import { useToast } from '@/shared/ui/Toast';
import { activeEffect, Colors, hexToRgba, radii } from '@/theme';
import { useUpdateCourse } from '@/features/course/queries/courseCatalogQueries';

export type CourseEditSheetInitialData = {
  name: string;
  level: CourseLevel;
  capacity: number;
  status: CourseStatus;
};

export type CourseEditSheetProps = {
  visible: boolean;
  courseId: string;
  initialData: CourseEditSheetInitialData;
  onClose: () => void;
  onSuccess: (updatedCourse: CourseResponse) => void;
};

type StatusTone = 'success' | 'danger' | 'neutral';

type CourseStatusOptionCardProps = {
  label: string;
  selected: boolean;
  tone: StatusTone;
  disabled?: boolean;
  renderIcon: (color: string) => React.ReactNode;
  onPress?: () => void;
};

const COURSE_STATUS_CONFIG: Record<
  CourseStatus,
  {
    label: string;
    tone: StatusTone;
    renderIcon: (color: string) => React.ReactNode;
  }
> = {
  OPEN: {
    label: CourseStatusLabel.OPEN,
    tone: 'success',
    renderIcon: (color) => <AppIcon icon={<DocText />} size={16} color={color} />,
  },
  ACTIVE: {
    label: CourseStatusLabel.ACTIVE,
    tone: 'success',
    renderIcon: (color) => <AppIcon icon={<Play />} size={14} color={color} />,
  },
  CLOSED: {
    label: CourseStatusLabel.CLOSED,
    tone: 'neutral',
    renderIcon: (color) => <Lock size={16} color={color} />,
  },
  CANCELLED: {
    label: CourseStatusLabel.CANCELLED,
    tone: 'danger',
    renderIcon: (color) => <Ban size={16} color={color} />,
  },
};

/**
 * Reusable single cell component for selecting course status.
 */
function CourseStatusOptionCard({
  label,
  selected,
  tone,
  disabled,
  renderIcon,
  onPress,
}: CourseStatusOptionCardProps) {
  const toneColor =
    tone === 'success'
      ? Colors.light.green
      : tone === 'danger'
        ? Colors.light.error
        : Colors.light.textSecondary;

  const iconColor = selected ? '#FFFFFF' : toneColor;
  const iconBgColor = selected
    ? toneColor
    : hexToRgba(toneColor, 0.12);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.statusCard,
        selected
          ? {
              backgroundColor: hexToRgba(toneColor, 0.05),
              borderColor: toneColor,
              borderWidth: 1.5,
            }
          : null,
        pressed && !disabled ? activeEffect(pressed, 'pressedScale') : null,
        disabled ? styles.cardDisabled : null,
      ]}
    >
      <View style={styles.statusCardLeft}>
        <View style={[styles.iconBadge, { backgroundColor: iconBgColor }]}>
          {renderIcon(iconColor)}
        </View>
        <ThemedText
          type="bodySmall"
          numberOfLines={1}
          style={[
            styles.statusCardLabel,
            selected ? { color: tone === 'neutral' ? Colors.light.text : toneColor, fontWeight: '700' } : null,
          ]}
        >
          {label}
        </ThemedText>
      </View>

      <View
        style={[
          styles.radioCircle,
          selected ? [styles.radioCircleSelected, { backgroundColor: toneColor, borderColor: toneColor }] : null,
        ]}
      >
        {selected ? <AppIcon icon={<Check />} size={12} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

function CourseEditSheetComponent({
  visible,
  courseId,
  initialData,
  onClose,
  onSuccess,
}: CourseEditSheetProps) {
  const toast = useToast();
  const { mutateAsync: updateCourse } = useUpdateCourse();

  const [name, setName] = useState(initialData?.name ?? '');
  const [capacity, setCapacity] = useState(String(initialData?.capacity ?? 0));
  const [level, setLevel] = useState<CourseLevel>(initialData.level);
  const [status, setStatus] = useState<CourseStatus>(initialData?.status ?? 'OPEN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baselineData, setBaselineData] = useState(initialData);

  const abortControllerRef = useRef<AbortController | null>(null);
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setBaselineData(initialData);
      setName(initialData?.name ?? '');
      setCapacity(String(initialData?.capacity ?? 0));
      setLevel(initialData.level);
      setStatus(initialData?.status ?? 'OPEN');
      setIsSubmitting(false);
    }
    prevVisibleRef.current = visible;
  }, [visible, initialData]);

  const parsedCapacity = useMemo(() => {
    const parsed = parseInt(capacity, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [capacity]);

  const isDirty = useMemo(() => {
    const trimmedName = (name ?? '').trim();
    const initialName = (baselineData?.name ?? '').trim();
    return (
      trimmedName !== initialName ||
      parsedCapacity !== (baselineData?.capacity ?? 0) ||
      level !== baselineData.level ||
      status !== (baselineData?.status ?? 'OPEN')
    );
  }, [name, parsedCapacity, level, status, baselineData]);

  const isValid = useMemo(() => {
    return (name ?? '').trim().length > 0 && parsedCapacity > 0;
  }, [name, parsedCapacity]);

  const handleCancelSubmit = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSubmitting(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!isDirty || !isValid || isSubmitting) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSubmitting(true);

    try {
      const updatedCourse = await updateCourse({
        courseId,
        request: {
          name: (name ?? '').trim(),
          level,
          capacity: parsedCapacity,
          status,
        },
        signal: controller.signal,
      });

      setIsSubmitting(false);
      abortControllerRef.current = null;
      toast.show({
        message: 'Cập nhật thông tin khóa học thành công',
        variant: 'success',
      });
      onSuccess(updatedCourse);
      onClose();
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        // Cancelled by user, keep sheet open silently
        return;
      }

      setIsSubmitting(false);
      abortControllerRef.current = null;
      const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const errorMessage = apiMessage || getApiErrorMessage(error, 'Không thể cập nhật khóa học. Vui lòng thử lại.');

      toast.show({
        message: errorMessage,
        variant: 'error',
      });
    }
  }, [courseId, isDirty, isValid, isSubmitting, name, level, parsedCapacity, status, toast, onSuccess, onClose, updateCourse]);

  return (
    <BottomSheetWindow
      visible={visible}
      title="Chỉnh sửa khóa học"
      heightRatio={0.78}
      onClose={isSubmitting ? handleCancelSubmit : onClose}
      overlay={
        <CancellableLoadingOverlay
          visible={isSubmitting}
          message="Đang lưu thay đổi khóa học..."
          cancelLabel="Hủy"
          onCancel={handleCancelSubmit}
        />
      }
      footer={
        <AdminButton
          label="Lưu thay đổi"
          variant="primary"
          disabled={!isDirty || !isValid || isSubmitting}
          onPress={() => {
            void handleSave();
          }}
        />
      }
    >
      <View style={styles.formContainer}>
        <AdminField
          label="Tên khóa học"
          placeholder="Nhập tên khóa học"
          value={name}
          onChangeText={setName}
          editable={!isSubmitting}
        />

        <View style={styles.statusSection}>
          <ThemedText type="featureLabel" style={styles.statusSectionTitle}>
            Level khóa học *
          </ThemedText>
          <View style={styles.levelRow}>
            {CourseLevelValues.map((value) => (
              <AdminChip
                key={value}
                label={CourseLevelLabel[value]}
                tone={value === 'EXPERT' ? 'danger' : value === 'ADVANCED' ? 'info' : 'neutral'}
                selected={level === value}
                onPress={isSubmitting ? undefined : () => setLevel(value)}
              />
            ))}
          </View>
        </View>

        <AdminField
          label="Sức chứa tối đa (học viên)"
          placeholder="Nhập số lượng học viên"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
          editable={!isSubmitting}
        />

        <View style={styles.statusSection}>
          <ThemedText type="featureLabel" style={styles.statusSectionTitle}>
            Trạng thái khóa học
          </ThemedText>
          <View style={styles.statusGrid}>
            {CourseStatusValues.map((s) => {
              const config = COURSE_STATUS_CONFIG[s];
              const isSelected = status === s;
              return (
                <CourseStatusOptionCard
                  key={s}
                  label={config.label}
                  tone={config.tone}
                  renderIcon={config.renderIcon}
                  selected={isSelected}
                  disabled={isSubmitting}
                  onPress={() => setStatus(s)}
                />
              );
            })}
          </View>
        </View>
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  statusSection: {
    gap: 10,
  },
  statusSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    minWidth: '47%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.xl,
    borderCurve: 'continuous',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  statusCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCardLabel: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  radioCircleSelected: {
    borderWidth: 0,
  },
  cardDisabled: {
    opacity: 0.6,
  },
});

export const CourseEditSheet = memo(CourseEditSheetComponent);

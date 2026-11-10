import React, { useMemo } from "react";
import { Check, Clock, DocText, Star, X } from "reicon-react-native";

import { PickerPopover, type PickerPopoverOption } from "@/shared/ui/PickerPopover";
import type { AppIconElement } from "@/theme/icons";

import type {
  AttendanceStatus,
  EvaluationStatus,
} from "../constants/session-attendance.constants";

export const ATTENDANCE_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    shortLabel: string;
    bg: string;
    text: string;
    border: string;
    icon: AppIconElement;
  }
> = {
  PRESENT: {
    label: "Có mặt",
    shortLabel: "Có mặt",
    bg: "#ECFDF5",
    text: "#065F46",
    border: "#A7F3D0",
    icon: <Check />,
  },
  ABSENT: {
    label: "Vắng",
    shortLabel: "Vắng",
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
    icon: <X />,
  },
  LATE: {
    label: "Đi muộn",
    shortLabel: "Muộn",
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    icon: <Clock />,
  },
  EXCUSED: {
    label: "Có phép",
    shortLabel: "Phép",
    bg: "#EFF6FF",
    text: "#2563EB",
    border: "#BFDBFE",
    icon: <DocText />,
  },
  MAKEUP: {
    label: "Học bù",
    shortLabel: "Học bù",
    bg: "#F5F3FF",
    text: "#7C3AED",
    border: "#DDD6FE",
    icon: <Clock />,
  },
};

export const EVALUATION_CONFIG: Record<
  EvaluationStatus,
  {
    label: string;
    shortLabel: string;
    bg: string;
    text: string;
    border: string;
    icon: AppIconElement;
  }
> = {
  GOOD: {
    label: "Tốt",
    shortLabel: "Tốt",
    bg: "#ECFDF5",
    text: "#065F46",
    border: "#A7F3D0",
    icon: <Star />,
  },
  AVERAGE: {
    label: "Trung bình",
    shortLabel: "T.Bình",
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    icon: <Clock />,
  },
  WEAK: {
    label: "Yếu",
    shortLabel: "Yếu",
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
    icon: <X />,
  },
  PENDING: {
    label: "Chờ đánh giá",
    shortLabel: "Chờ",
    bg: "#F3F4F6",
    text: "#4B5563",
    border: "#E5E7EB",
    icon: <Clock />,
  },
};

export type StatusPickerPopoverProps =
  | {
      type: "attendance";
      visible: boolean;
      currentValue?: AttendanceStatus | null;
      studentName: string;
      onSelect: (val: AttendanceStatus) => void;
      onClose: () => void;
    }
  | {
      type: "evaluation";
      visible: boolean;
      currentValue?: EvaluationStatus | null;
      studentName: string;
      onSelect: (val: EvaluationStatus) => void;
      onClose: () => void;
    };

export function StatusPickerPopover(props: StatusPickerPopoverProps) {
  const { visible, onClose, studentName, type } = props;

  const options: PickerPopoverOption<AttendanceStatus | EvaluationStatus>[] = useMemo(() => {
    if (type === "attendance") {
      const keys: AttendanceStatus[] = ["PRESENT", "LATE", "EXCUSED", "MAKEUP", "ABSENT"];
      return keys.map((key) => {
        const cfg = ATTENDANCE_CONFIG[key];
        return {
          value: key,
          label: cfg.label,
          icon: cfg.icon,
          bg: cfg.bg,
          text: cfg.text,
          border: cfg.border,
        };
      });
    }

    const keys: EvaluationStatus[] = ["GOOD", "AVERAGE", "WEAK", "PENDING"];
    return keys.map((key) => {
      const cfg = EVALUATION_CONFIG[key];
      return {
        value: key,
        label: cfg.label,
        icon: cfg.icon,
        bg: cfg.bg,
        text: cfg.text,
        border: cfg.border,
      };
    });
  }, [type]);

  if (!visible) return null;

  return (
    <PickerPopover
      visible={visible}
      title={studentName}
      subtitle={type === "attendance" ? "Cập nhật điểm danh" : "Cập nhật đánh giá"}
      options={options}
      selectedValue={props.currentValue}
      onSelect={(val) => {
        if (type === "attendance") {
          (props.onSelect as (val: AttendanceStatus) => void)(val as AttendanceStatus);
        } else {
          (props.onSelect as (val: EvaluationStatus) => void)(val as EvaluationStatus);
        }
      }}
      onClose={onClose}
    />
  );
}

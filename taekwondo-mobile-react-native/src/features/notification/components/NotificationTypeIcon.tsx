import { Bell, Calendar, Check, Clock, DocText, NoteText, Wallet } from "reicon-react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { Colors } from "@/theme";
import type { AppIconElement } from "@/theme/icons";

import type { NotificationType } from "../constants/notification.constants";

const notificationTypeIcon: Record<NotificationType, AppIconElement> = {
  SYSTEM: <Bell />,
  ATTENDANCE: <Check />,
  TUITION: <Wallet />,
  CLASS_SCHEDULE: <Calendar />,
  COACH_TIMESHEET: <Clock />,
  ANNOUNCEMENT: <NoteText />,
  CLASS_SESSION_REPORT: <DocText />,
};

export type NotificationTypeIconProps = {
  type: NotificationType;
  size?: number;
  color?: string;
};

export function NotificationTypeIcon({
  type,
  size = 22,
  color = Colors.light.primary,
}: NotificationTypeIconProps) {
  return <AppIcon icon={notificationTypeIcon[type]} size={size} color={color} />;
}

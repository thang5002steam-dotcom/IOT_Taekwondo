import type { AppIconElement } from "@/theme/icons";
import type { PermissionValue } from '@/features/authorization';

export type ActivitiesAction = {
  id: string;
  label: string;
  icon: AppIconElement;
  defaultQuick?: boolean;
  requiredPermissions?: readonly PermissionValue[];
};

export type ActivitiesActionGroup = {
  title?: string;
  actions: ActivitiesAction[];
};

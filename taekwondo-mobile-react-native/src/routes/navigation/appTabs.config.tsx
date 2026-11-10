import type { Href } from "expo-router";
import {
  Calendar,
  Database,
  Home,
  Qr,
  User,
  Widget,
} from "reicon-react-native";

import type { PermissionValue } from "@/features/authorization";
import type { AppIconElement } from "@/theme/icons";

export type AppTabName =
  | "index"
  | "activities"
  | "check-in"
  | "schedule"
  | "account"
  | "explore";

export interface AppTabConfig {
  name: AppTabName;
  label: string;
  href: Href;
  icon: AppIconElement;
  activeIcon?: AppIconElement;
  /**
   * Permissions required to show this tab.
   * Empty means the tab is always visible for authenticated users.
   * Wire these up when the feature behind the tab has a real screen/API.
   */
  requiredPermissions?: PermissionValue[];
  display: boolean;
  centerAction?: boolean;
}

export const APP_TABS: AppTabConfig[] = [
  {
    name: "index",
    label: "Trang chủ",
    href: "/(app)/(tabs)",
    icon: <Home />,
    activeIcon: <Home weight="Filled" />,
    requiredPermissions: [],
    display: true,
  },
  {
    name: "activities",
    label: "Tính năng",
    href: "/activities",
    icon: <Database />,
    activeIcon: <Database weight="Filled" />,
    requiredPermissions: [],
    display: true,
  },
  {
    name: "check-in",
    label: "Quét mã",
    href: "/check-in",
    icon: <Qr />,
    requiredPermissions: [],
    display: true,
    centerAction: true,
  },
  {
    name: "schedule",
    label: "Lịch học",
    href: "/schedule",
    icon: <Calendar />,
    activeIcon: <Calendar />,
    requiredPermissions: [],
    display: true,
  },
  {
    name: "account",
    label: "Tài khoản",
    href: "/account",
    icon: <User />,
    activeIcon: <User weight="Filled" />,
    requiredPermissions: [],
    display: true,
  },
  {
    name: "explore",
    label: "Khám phá",
    href: "/explore",
    icon: <Widget />,
    activeIcon: <Widget weight="Filled" />,
    requiredPermissions: [],
    display: false,
  },
];

export const VISIBLE_APP_TABS = APP_TABS.filter((tab) => tab.display);

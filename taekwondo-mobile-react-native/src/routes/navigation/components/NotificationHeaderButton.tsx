import { useAuthSession } from "@/features/authentication";
import { useNotificationStore } from "@/features/notification/store/notification.store";
import { useRouter, type Href } from "expo-router";
import { Bell } from "reicon-react-native";

import { HeaderActionButton } from "./HeaderActionButton";

export function NotificationHeaderButton({ color }: { color?: string }) {
  const router = useRouter();
  // App inbox is app-facing (backend only requires an authenticated user);
  // the management permission stays on the admin CRUD endpoints only.
  const { isAuthenticated } = useAuthSession();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const badge =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? unreadCount : undefined;

  if (!isAuthenticated) return null;

  return (
    <HeaderActionButton
      icon={<Bell />}
      label="Thông báo"
      badge={badge}
      color={color}
      onPress={() => router.navigate("/notifications" as Href)}
      testID="notification-header-button"
    />
  );
}

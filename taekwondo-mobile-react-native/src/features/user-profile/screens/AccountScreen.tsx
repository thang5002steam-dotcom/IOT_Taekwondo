import { Bell, ChevronRight, Headphones, LockOpen, Logout, User, Verified, Wallet } from "reicon-react-native";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { useAuthSession, useLogout } from "@/features/authentication";
import BottomTabScreenLayout from "@/routes/navigation/layouts/BottomTabScreenLayout";
import { AppIcon } from "@/shared/ui/AppIcon";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { useToast } from "@/shared/ui/Toast";
import { ThemedText } from "@/shared/ui/ThemedText";
import { showComingSoon } from "@/shared/utils/comingSoon";
import { Colors, activeEffect, effects, radii } from "@/theme";

import {
  AccountMenuSection,
  type AccountMenuItem,
} from "../components/AccountMenuSection";
import { AccountProfileCard } from "../components/AccountProfileCard";
import { AccountRatingCard } from "../components/AccountRatingCard";

function contextRoleLabel(personCode?: string | null) {
  if (personCode?.startsWith("VQ_")) return "Học viên";
  if (personCode?.startsWith("VQT_")) return "Nhân viên";
  return "Học viên";
}

export default function AccountScreen() {
  const router = useRouter();
  const toast = useToast();
  const { activeContext, user, availableContextCount, isAuthenticated } =
    useAuthSession();
  const canOpenNotifications = isAuthenticated;
  const logout = useLogout();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const displayName = (
    activeContext?.displayName ??
    user?.phoneNumber ??
    "NGUYỄN HOÀNG MINH QUÂN"
  ).toLocaleUpperCase("vi-VN");
  const profileLabel = contextRoleLabel(activeContext?.personCode);

  const profileItems = useMemo<AccountMenuItem[]>(
    () => [
      {
        label: "Thông tin chung",
        icon: <User />,
        onPress: () => router.push("/account/general-info"),
      },
      {
        label: "Ví điện tử",
        icon: <Wallet />,
        onPress: () => router.push("/account/wallet" as Href),
      },
      {
        label: "Thành tích",
        icon: <Verified />,
        onPress: () => showComingSoon(toast),
      },
    ],
    [router, toast],
  );

  const settingItems = useMemo<AccountMenuItem[]>(() => {
    const items: AccountMenuItem[] = [
      {
        label: "Đổi mật khẩu",
        icon: <LockOpen />,
        onPress: () => router.push('/account/change-password' as Href),
      },
      {
        label: "Email khôi phục",
        icon: <Verified />,
        onPress: () => router.push('/account/recovery-email' as Href),
      },
      {
        label: "Liên hệ",
        icon: <Headphones />,
        onPress: () => showComingSoon(toast),
      },
    ];
    if (canOpenNotifications) {
      items.splice(1, 0, {
        label: "Thông báo",
        icon: <Bell />,
        onPress: () => showComingSoon(toast),
      });
    }
    return items;
  }, [canOpenNotifications, toast]);

  const switchAccount = () => {
    router.push({ pathname: "/(context)/select", params: { mode: "switch" } });
  };

  const confirmLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => setConfirmingLogout(false),
    });
  };

  return (
    <BottomTabScreenLayout title="Tài khoản" activeTab="account">
      <AccountProfileCard
        displayName={displayName}
        profileLabel={profileLabel}
        canSwitchAccount={true}
        onSwitchAccount={switchAccount}
      />

      <AccountMenuSection title="Hồ sơ cá nhân" items={profileItems} />
      <AccountMenuSection title="Cài đặt" items={settingItems} />
      <AccountRatingCard />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Đăng xuất"
        accessibilityState={{ busy: logout.isPending }}
        disabled={logout.isPending}
        onPress={() => setConfirmingLogout(true)}
        style={({ pressed }) => [
          styles.logoutButton,
          activeEffect(pressed, "pressedScale"),
          logout.isPending ? styles.disabled : null,
        ]}
      >
        {logout.isPending ? (
          <ActivityIndicator color={Colors.light.surface} />
        ) : (
          <>
            <AppIcon icon={<Logout />}
              size={29}
              color={Colors.light.surface}
            />
            <ThemedText type="body" style={styles.logoutText}>
              Đăng xuất
            </ThemedText>
            <AppIcon icon={<ChevronRight />}
              width={9}
              height={15}
              color={Colors.light.surface}
            />
          </>
        )}
      </Pressable>

      <ConfirmationDialog
        visible={confirmingLogout}
        title="Bạn có chắc muốn đăng xuất?"
        description="Phiên hiện tại trên thiết bị này sẽ kết thúc."
        confirmLabel="Đăng xuất"
        pending={logout.isPending}
        confirmVariant="danger"
        onCancel={() => setConfirmingLogout(false)}
        onConfirm={confirmLogout}
      />
    </BottomTabScreenLayout>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 20,
    height: 60,
    borderRadius: radii.xl,
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 25,
    gap: 10,
    ...effects.card,
  },
  logoutText: {
    flex: 1,
    color: Colors.light.surface,
  },
  disabled: {
    opacity: 0.5,
  },
});

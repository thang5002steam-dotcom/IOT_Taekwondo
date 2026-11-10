import { Home } from "reicon-react-native";
import { useRouter } from 'expo-router';

import { HeaderActionButton } from './HeaderActionButton';

export function HomeHeaderButton({ color }: { color?: string }) {
  const router = useRouter();

  const handlePress = () => {
    if (router.canDismiss()) {
      router.dismissTo('/');
    } else {
      router.replace('/');
    }
  };

  return (
    <HeaderActionButton
      icon={<Home />}
      label="Trang chủ"
      color={color}
      onPress={handlePress}
      testID="home-header-button"
    />
  );
}

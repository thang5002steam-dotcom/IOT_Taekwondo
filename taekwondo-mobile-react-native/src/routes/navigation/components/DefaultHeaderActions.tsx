import { HomeHeaderButton } from './HomeHeaderButton';
import { NotificationHeaderButton } from './NotificationHeaderButton';

export function DefaultHeaderActions({ color }: { color?: string }) {
  return (
    <>
      <NotificationHeaderButton color={color} />
      <HomeHeaderButton color={color} />
    </>
  );
}

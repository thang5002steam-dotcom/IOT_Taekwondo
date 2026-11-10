import { WebUnsupportedScreen } from "@/shared/ui/platform/WebUnsupportedScreen";

export default function KneeCounterNativeFallback() {
  return <WebUnsupportedScreen title="AI Knee Counter chưa hỗ trợ trên thiết bị này" description="Tính năng đếm rút gối hiện chỉ hỗ trợ Chrome hoặc Edge trên máy tính Windows." />;
}

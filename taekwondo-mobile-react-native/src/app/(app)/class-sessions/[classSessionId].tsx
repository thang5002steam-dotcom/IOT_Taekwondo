import { useLocalSearchParams } from "expo-router";

import { Permission } from "@/features/authorization";
import { ClassSessionDetailScreen } from "@/features/class-session";
import { RequirePermission } from "@/routes/navigation/RequirePermission";

export default function ClassSessionDetailRoute() {
  const { classSessionId } = useLocalSearchParams<{
    classSessionId?: string;
  }>();

  return (
    <RequirePermission permission={Permission.CLASS_SESSION_READ}>
      <ClassSessionDetailScreen classSessionId={classSessionId} />
    </RequirePermission>
  );
}

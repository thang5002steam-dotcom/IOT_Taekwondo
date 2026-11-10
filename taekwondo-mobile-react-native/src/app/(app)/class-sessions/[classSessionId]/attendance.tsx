import { useLocalSearchParams } from "expo-router";

import { Permission } from "@/features/authorization";
import { SessionAttendanceScreen } from "@/features/session-attendance";
import { RequirePermission } from "@/routes/navigation/RequirePermission";

export default function ClassSessionAttendanceRoute() {
  const { classSessionId } = useLocalSearchParams<{
    classSessionId?: string;
  }>();

  return (
    <RequirePermission permission={Permission.SESSION_ATTENDANCE_READ}>
      <SessionAttendanceScreen classSessionId={classSessionId} />
    </RequirePermission>
  );
}

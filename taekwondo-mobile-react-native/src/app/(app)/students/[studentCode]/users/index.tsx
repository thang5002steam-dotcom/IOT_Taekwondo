import { Redirect, useLocalSearchParams, type Href } from "expo-router";

import { Permission, useCan } from "@/features/authorization";
import { PersonUserAccountsScreen } from "@/features/user";

export default function StudentUserAccountsRoute() {
  const { studentCode } = useLocalSearchParams<{ studentCode?: string }>();
  const canReadUserPersons = useCan(Permission.USER_PERSON_READ);
  const canReadUsers = useCan(Permission.USER_READ);
  const personId = Array.isArray(studentCode) ? studentCode[0] : studentCode;

  if (!canReadUserPersons || !canReadUsers) {
    return <Redirect href={(personId ? `/students/${personId}` : "/students") as Href} />;
  }

  return <PersonUserAccountsScreen personId={personId} />;
}

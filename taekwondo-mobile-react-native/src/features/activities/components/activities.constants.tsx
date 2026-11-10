import type { ActivitiesActionGroup } from "@/features/activities/domain/activities.types";
import { Permission } from "@/features/authorization";
import {
  BookOpen,
  Building,
  CalendarTick,
  Hierarchy,
  Layers,
  Profile,
  Ranking,
  ShieldUser,
  SignalStream,
  Teacher,
  Target,
  Users2,
} from "reicon-react-native";

export const ACTIVITIES_GROUPS: ActivitiesActionGroup[] = [
  {
    title: "Hoạt động & thành tích",
    actions: [
      {
        id: "attendance-history",
        label: "Lịch sử",
        icon: <CalendarTick />,
        defaultQuick: true,
      },
      {
        id: "ranking",
        label: "Bảng xếp hạng",
        icon: <Ranking />,
        defaultQuick: true,
      },
      {
        id: "sparring",
        label: "Đối kháng",
        icon: <Target />,
      },
    ],
  },
  {
    title: "Quản lý đào tạo",
    actions: [
      {
        id: "student-list",
        label: "Học viên",
        icon: <Users2 />,
        defaultQuick: true,
      },
      {
        id: "coach-list",
        label: "Huấn luyện viên",
        icon: <Teacher />,
        defaultQuick: true,
      },
      {
        id: "course-list",
        label: "Khóa học",
        icon: <BookOpen />,
      },
      {
        id: "training-plan-list",
        label: "Gói học",
        icon: <Layers />,
        requiredPermissions: [Permission.TRAINING_PLAN_READ],
      },
    ],
  },
  {
    title: "Vận hành",
    actions: [
      {
        id: "branch-list",
        label: "Cơ sở",
        icon: <Building />,
      },
      {
        id: "mqtt-sensor",
        label: "Cảm biến (MQTT)",
        icon: <SignalStream />,
      },
    ],
  },
  {
    title: "Hệ thống & phân quyền",
    actions: [
      {
        id: "role-permission-admin",
        label: "Vai trò & quyền",
        icon: <ShieldUser />,
        requiredPermissions: [Permission.ROLE_READ, Permission.PERMISSION_READ],
      },
      {
        id: "position-admin",
        label: "Chức vụ",
        icon: <Hierarchy />,
        requiredPermissions: [Permission.POSITION_READ],
      },
      {
        id: "user-admin",
        label: "Người dùng",
        icon: <Profile />,
        requiredPermissions: [Permission.USER_READ],
      },
    ],
  },
];

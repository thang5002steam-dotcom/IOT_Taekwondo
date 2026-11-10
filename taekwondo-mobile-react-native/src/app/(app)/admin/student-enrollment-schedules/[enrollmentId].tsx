import { useLocalSearchParams } from 'expo-router';
import { StudentEnrollmentScheduleScreen } from '@/features/student-enrollment-schedule/screens/StudentEnrollmentScheduleScreen';
export default function Page(){const {enrollmentId}=useLocalSearchParams<{enrollmentId:string}>();return <StudentEnrollmentScheduleScreen enrollmentId={Array.isArray(enrollmentId)?enrollmentId[0]:enrollmentId}/>;}

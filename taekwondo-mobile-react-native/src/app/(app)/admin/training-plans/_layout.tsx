import { Permission, useCan } from '@/features/authorization';
import { Redirect, Stack } from 'expo-router';
export default function TrainingPlansLayout(){return useCan(Permission.TRAINING_PLAN_READ)?<Stack screenOptions={{headerShown:false}}/>:<Redirect href="/activities"/>;}

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Trash6 } from 'reicon-react-native';

import { Permission, useCan } from '@/features/authorization';
import StackScreenLayout from '@/routes/navigation/layouts/StackScreenLayout';
import { AppIcon } from '@/shared/ui/AppIcon';
import { CancellableLoadingOverlay } from '@/shared/ui/CancellableLoadingOverlay';
import { ConfirmationDialog } from '@/shared/ui/ConfirmationDialog';
import { FloatingActionBar } from '@/shared/ui/FloatingActionBar';
import { ThemedText } from '@/shared/ui/ThemedText';
import { useToast } from '@/shared/ui/Toast';
import { Colors, radii } from '@/theme';
import {
  AdminButton,
  AdminCard,
  AdminChip,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminField,
  AdminInfoBanner,
  AdminIntro,
  AdminListRow,
  AdminLoadingState,
  AdminSearchField,
  AdminSectionHeader,
  AdminSwitchField,
  adminStyles,
} from '@/shared/ui/admin/AdministrationPrimitives';
import {
  useCreatePosition,
  useDeletePosition,
  usePosition,
  usePositionPeople,
  usePositions,
  useUpdatePosition,
} from '../queries/positionQueries';
import { formatDateTime } from '@/shared/utils/dateTime';
import { containsSearch, initials } from '@/shared/utils/string';

function usePositionId() {
  const { positionId } = useLocalSearchParams<{ positionId: string }>();
  return Array.isArray(positionId) ? positionId[0] : positionId;
}

function navigate(router: ReturnType<typeof useRouter>, path: string) { router.push(path as Href); }

function Avatar({ name }: { name?: string | null }) {
  return <View style={styles.avatar}><ThemedText type="featureLabel" style={styles.avatarText}>{initials(name)}</ThemedText></View>;
}

export function PositionListScreen() {
  const router = useRouter();
  const positions = usePositions();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const visible = (positions.data?.content ?? []).filter((item) => containsSearch(search, item.name, item.code) && (status === 'all' || item.active === (status === 'active')));
  return (
    <StackScreenLayout title="Chức vụ" contentContainerStyle={adminStyles.listScreen}>
      <AdminIntro>Quản lý chức vụ và tra cứu nhân sự theo vị trí công việc.</AdminIntro>
      <AdminSearchField value={search} onChangeText={setSearch} placeholder="Tìm tên hoặc mã chức vụ" />
      <View style={adminStyles.chips}>
        <AdminChip label="Tất cả" selected={status === 'all'} onPress={() => setStatus('all')} />
        <AdminChip label="Hoạt động" selected={status === 'active'} onPress={() => setStatus('active')} />
        <AdminChip label="Ngừng dùng" selected={status === 'inactive'} onPress={() => setStatus('inactive')} />
      </View>
      <AdminSectionHeader title={`${visible.length} chức vụ`} actionLabel="Tạo chức vụ" onAction={() => navigate(router, '/admin/positions/create')} />
      {positions.isPending ? <AdminLoadingState /> : visible.length === 0 ? <AdminEmptyState message="Không tìm thấy chức vụ phù hợp" /> : (
        <View style={styles.list}>
          {visible.map((item) => {
            const countLabel = item.personCount !== undefined ? ` · ${item.personCount} nhân sự` : '';
            return (
              <AdminListRow
                key={item.positionId}
                title={item.name}
                subtitle={`${item.code}${countLabel}`}
                meta={<AdminChip label={item.active ? 'Hoạt động' : 'Ngừng dùng'} tone={item.active ? 'success' : 'neutral'} />}
                onPress={() => navigate(router, `/admin/positions/${item.positionId}`)}
              />
            );
          })}
        </View>
      )}
    </StackScreenLayout>
  );
}

export function PositionDetailScreen() {
  const router = useRouter();
  const positionId = usePositionId();
  const position = usePosition(positionId);
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteController = useRef<AbortController | null>(null);
  const canDelete = useCan(Permission.POSITION_DELETE);
  const remove = useDeletePosition();
  const handleDelete = async () => {
    if (!positionId) return;
    setConfirming(false);
    setDeleting(true);
    const controller = new AbortController();
    deleteController.current = controller;
    try {
      await remove.mutateAsync({ positionId, signal: controller.signal });
      toast.show({ message: 'Đã xóa chức vụ', variant: 'success' });
      router.replace('/admin/positions' as Href);
    } catch (error) {
      if ((error as { name?: string }).name !== 'AbortError') {
        toast.show({ message: 'Không thể xóa chức vụ đang có nhân sự', variant: 'error' });
      }
    } finally {
      deleteController.current = null;
      setDeleting(false);
    }
  };
  return (
    <>
      <StackScreenLayout
        title="Chi tiết chức vụ"
        contentContainerStyle={[adminStyles.screen, { paddingBottom: 128 }]}
        floatingContent={position.data ? <FloatingActionBar actions={[
          { label: 'Chỉnh sửa', accessibilityLabel: 'Chỉnh sửa chức vụ', variant: 'outline', onPress: () => navigate(router, `/admin/positions/${positionId}/edit`) },
          { label: 'Xem nhân sự', accessibilityLabel: 'Xem nhân sự theo chức vụ', variant: 'primary', flex: 1.3, onPress: () => navigate(router, `/admin/positions/${positionId}/staff`) },
          ...(canDelete ? [{ key: 'delete', label: '', accessibilityLabel: 'Xóa chức vụ', variant: 'ghost' as const, disabled: deleting, flex: 0, onPress: () => setConfirming(true), style: { width: 44, minWidth: 44, paddingHorizontal: 0, backgroundColor: 'transparent', borderWidth: 0 }, icon: <AppIcon icon={<Trash6 />} size={30} color={deleting ? Colors.light.textSecondary : Colors.light.error} /> }] : []),
        ]} /> : undefined}
      >
        {position.isPending ? <AdminLoadingState /> : !position.data ? <AdminEmptyState message="Không tìm thấy chức vụ" /> : <>
        <AdminCard style={adminStyles.gap}>
          <View style={styles.titleRow}><View style={adminStyles.grow}><ThemedText type="heading">{position.data.name}</ThemedText><ThemedText type="code" style={styles.code}>{position.data.code}</ThemedText></View><AdminChip label={position.data.active ? 'Hoạt động' : 'Ngừng dùng'} tone={position.data.active ? 'success' : 'neutral'} /></View>
          <ThemedText type="bodySmall" style={adminStyles.muted}>{position.data.description || 'Chưa có mô tả'}</ThemedText>
        </AdminCard>
        <AdminCard><AdminListRow title={`${position.data.personCount ?? 0} nhân sự`} subtitle="Đang giữ chức vụ này" onPress={() => navigate(router, `/admin/positions/${positionId}/staff`)} /></AdminCard>
        <AdminCard style={adminStyles.gap}><View style={adminStyles.labelValue}><ThemedText type="featureLabel">Ngày tạo</ThemedText><ThemedText type="bodySmall" style={adminStyles.muted}>{formatDateTime(position.data.createdAt)}</ThemedText></View><View style={adminStyles.labelValue}><ThemedText type="featureLabel">Cập nhật gần nhất</ThemedText><ThemedText type="bodySmall" style={adminStyles.muted}>{formatDateTime(position.data.updatedAt)}</ThemedText></View></AdminCard>
      </>}
      </StackScreenLayout>
      <ConfirmationDialog visible={confirming} title="Xóa chức vụ" description={`Chức vụ “${position.data?.name ?? ''}” sẽ bị xóa vĩnh viễn. Hãy bảo đảm không còn nhân sự được gán.`} confirmLabel="Xóa" confirmVariant="danger" onCancel={() => setConfirming(false)} onConfirm={handleDelete} />
      <CancellableLoadingOverlay visible={deleting} message="Đang xóa chức vụ..." cancelLabel="Hủy" onCancel={() => deleteController.current?.abort()} />
    </>
  );
}

export function PositionStaffScreen() {
  const positionId = usePositionId();
  const position = usePosition(positionId);
  const people = usePositionPeople(positionId);
  const [search, setSearch] = useState('');
  const visible = people.people.filter((person) => containsSearch(search, person.fullName, person.personCode));
  const staffCount = position.data?.personCount ?? people.people.length;

  return (
    <StackScreenLayout title="Nhân sự theo chức vụ" contentContainerStyle={adminStyles.screen}>
      <AdminCard><ThemedText type="title">{position.data?.name ?? 'Chức vụ'}</ThemedText><ThemedText type="bodySmall" style={adminStyles.muted}>{staffCount} nhân sự</ThemedText></AdminCard>
      <AdminSearchField value={search} onChangeText={setSearch} placeholder="Tìm tên hoặc mã nhân sự" />
      {people.isPending ? <AdminLoadingState /> : visible.length === 0 ? <AdminEmptyState message="Chưa có nhân sự ở chức vụ này" /> : <View style={styles.list}>{visible.map((person) => <AdminListRow key={person.personId} leading={<Avatar name={person.fullName} />} title={person.fullName} subtitle={person.personCode} meta={<AdminChip label={person.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'} tone={person.status === 'ACTIVE' ? 'success' : 'neutral'} />} />)}</View>}
    </StackScreenLayout>
  );
}

function PositionFormScreen({ mode }: { mode: 'create' | 'edit' }) {
  const router = useRouter();
  const positionId = usePositionId();
  const position = usePosition(mode === 'edit' ? positionId : undefined);
  const toast = useToast();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    if (!position.data) return;
    // Async server state seeds an editable draft when the record arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(position.data.code); setName(position.data.name); setDescription(position.data.description ?? ''); setActive(position.data.active);
  }, [position.data]);
  const mutationCallbacks = {
    onSuccess: async (saved: { positionId: string }) => { toast.show({ message: mode === 'create' ? 'Đã tạo chức vụ' : 'Đã cập nhật chức vụ', variant: 'success' }); setConfirming(false); router.replace(`/admin/positions/${saved.positionId}` as Href); },
    onError: () => toast.show({ message: 'Không thể lưu chức vụ', variant: 'error' }),
  };
  const createPosition = useCreatePosition(mutationCallbacks);
  const updatePosition = useUpdatePosition(mutationCallbacks);
  const remove = useDeletePosition({ onSuccess: async () => { router.replace('/admin/positions' as Href); }, onError: () => toast.show({ message: 'Không thể xóa chức vụ đang có nhân sự', variant: 'error' }) });
  const savePending = createPosition.isPending || updatePosition.isPending;
  const save = () => {
    const request = { code: code.trim().toUpperCase(), name: name.trim(), description: description.trim() || null, active };
    if (mode === 'create') createPosition.mutate(request);
    else updatePosition.mutate({ id: positionId as string, request });
  };
  const valid = code.trim().length > 1 && name.trim().length > 1;
  return (
    <StackScreenLayout title={mode === 'create' ? 'Tạo chức vụ' : 'Sửa chức vụ'} contentContainerStyle={adminStyles.screen}>
      <AdminField label="Mã chức vụ" value={code} onChangeText={setCode} placeholder="Ví dụ: HEAD_COACH" />
      <AdminField label="Tên chức vụ" value={name} onChangeText={setName} placeholder="Nhập tên hiển thị" />
      <AdminField label="Mô tả" value={description} onChangeText={setDescription} multiline placeholder="Mô tả trách nhiệm chính" />
      <AdminSwitchField label="Đang hoạt động" description="Cho phép gán chức vụ này cho nhân sự." value={active} onValueChange={setActive} />
      {mode === 'edit' ? <AdminInfoBanner>Việc ngừng dùng chức vụ không tự động gỡ chức vụ khỏi nhân sự hiện tại.</AdminInfoBanner> : null}
      <AdminButton label={mode === 'create' ? 'Tạo chức vụ' : 'Lưu thay đổi'} disabled={!valid} onPress={() => setConfirming(true)} />
      {mode === 'edit' ? <AdminButton label="Xóa chức vụ" variant="text" onPress={() => setConfirmDelete(true)} /> : <AdminButton label="Hủy" variant="secondary" onPress={() => router.back()} />}
      <AdminConfirmDialog confirming={confirming} title={mode === 'create' ? 'Tạo chức vụ mới?' : 'Lưu thay đổi?'} message={`Thông tin “${name || 'chức vụ'}” sẽ được ${mode === 'create' ? 'tạo mới' : 'cập nhật'}.`} confirmLabel={mode === 'create' ? 'Tạo mới' : 'Lưu'} loading={savePending} onCancel={() => setConfirming(false)} onConfirm={save} />
      <AdminConfirmDialog confirming={confirmDelete} title="Xóa chức vụ?" message="Chức vụ sẽ bị xóa vĩnh viễn và không thể hoàn tác." confirmLabel="Xóa" destructive loading={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={() => remove.mutate(positionId as string)} />
    </StackScreenLayout>
  );
}

export function PositionCreateScreen() { return <PositionFormScreen mode="create" />; }
export function PositionEditScreen() { return <PositionFormScreen mode="edit" />; }

const styles = StyleSheet.create({
  list: { overflow: 'hidden', borderRadius: radii.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  code: { color: Colors.light.primary, marginTop: 4 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.primarySoft },
  avatarText: { color: Colors.light.primary },
});

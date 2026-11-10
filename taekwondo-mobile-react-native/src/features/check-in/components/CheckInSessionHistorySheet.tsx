import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BottomSheetWindow } from '@/shared/ui/BottomSheetWindow';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, radii } from '@/theme';
import type { CheckInRecord } from '../types/checkIn.types';

type CheckInSessionHistorySheetProps = {
  visible: boolean;
  history: CheckInRecord[];
  onClose: () => void;
};

function CheckInSessionHistorySheetComponent({
  visible,
  history,
  onClose,
}: CheckInSessionHistorySheetProps) {
  return (
    <BottomSheetWindow
      visible={visible}
      title={`Lịch sử quét phiên này (${history.length})`}
      heightRatio={0.65}
      onClose={onClose}
    >
      <View style={styles.container}>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={styles.emptyText}>
              Chưa có lượt điểm danh nào trong phiên này.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {history.map((item, index) => {
              const isStudent = item.role === 'STUDENT';
              return (
                <View key={`${item.id}-${index}`} style={styles.itemCard}>
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                  <View style={styles.itemInfo}>
                    <View style={styles.rowBetween}>
                      <ThemedText type="heading" style={styles.name} numberOfLines={1}>
                        {item.fullName}
                      </ThemedText>
                      <View
                        style={[
                          styles.roleBadge,
                          isStudent ? styles.studentBadge : styles.coachBadge,
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.roleText,
                            isStudent ? styles.studentText : styles.coachText,
                          ]}
                        >
                          {isStudent ? 'Học viên' : 'HLV'}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.rowBetween}>
                      <ThemedText type="caption" style={styles.codeText}>
                        {isStudent ? `Mã: ${item.code}` : `Mã NV: ${item.code}`}
                      </ThemedText>
                      <ThemedText type="caption" style={styles.timeText}>
                        {item.checkInTime}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </BottomSheetWindow>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: radii.sm,
    padding: 10,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.divider,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: Colors.light.divider,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  studentBadge: {
    backgroundColor: '#FEE2E2',
  },
  coachBadge: {
    backgroundColor: '#E0F2FE',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  studentText: {
    color: Colors.light.primary,
  },
  coachText: {
    color: '#0284C7',
  },
  codeText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  timeText: {
    color: Colors.light.success,
    fontWeight: '600',
    fontSize: 12,
  },
});

export const CheckInSessionHistorySheet = memo(CheckInSessionHistorySheetComponent);

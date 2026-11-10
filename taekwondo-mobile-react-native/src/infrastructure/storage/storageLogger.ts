import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { getRawDatabase } from '@/infrastructure/database/database';

const KNOWN_SECURE_STORE_KEYS = [
  'auth.tokens.v1',
  'refreshToken',
  'refresh_token',
  'token',
  'access_token',
];

function tryParseJson(value: string | null): unknown {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export const storageLogger = {
  /**
   * Log toàn bộ dữ liệu trong AsyncStorage ra console một cách ngay ngắn.
   */
  async logAsyncStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('\n==================================================');
      console.log(`📦 [AsyncStorage] Tổng số keys: ${keys.length}`);
      console.log('==================================================');

      if (keys.length === 0) {
        console.log('(Không có dữ liệu trong AsyncStorage)');
        console.log('--------------------------------------------------\n');
        return;
      }

      const pairs = await AsyncStorage.multiGet([...keys]);
      pairs.forEach(([key, val], index) => {
        console.log(`\n[${index + 1}/${keys.length}] 🔑 Key: "${key}"`);
        const parsed = tryParseJson(val);
        if (typeof parsed === 'object' && parsed !== null) {
          console.log('📄 Value (Object/JSON):');
          console.log(JSON.stringify(parsed, null, 2));
        } else {
          console.log(`📄 Value (Raw): ${val}`);
        }
      });
      console.log('\n==================================================\n');
    } catch (error) {
      console.error('[StorageLogger] Lỗi khi đọc AsyncStorage:', error);
    }
  },

  /**
   * Log các thông tin lưu trữ trong SecureStore ra console một cách ngay ngắn.
   */
  async logSecureStore(extraKeys: string[] = []): Promise<void> {
    try {
      const keysToCheck = Array.from(new Set([...KNOWN_SECURE_STORE_KEYS, ...extraKeys]));
      console.log('\n==================================================');
      console.log(`🔒 [SecureStore] Kiểm tra các key bảo mật (${keysToCheck.length} keys)`);
      console.log('==================================================');

      let foundCount = 0;
      for (const key of keysToCheck) {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) {
          foundCount++;
          console.log(`\n🔑 Key: "${key}"`);
          const parsed = tryParseJson(value);
          if (typeof parsed === 'object' && parsed !== null) {
            console.log('🔐 Value (Object/JSON):');
            console.log(JSON.stringify(parsed, null, 2));
          } else {
            console.log(`🔐 Value (Raw): ${value}`);
          }
        }
      }

      if (foundCount === 0) {
        console.log('(Không tìm thấy key nào trong danh sách SecureStore)');
      } else {
        console.log(`\n(Đã tìm thấy ${foundCount}/${keysToCheck.length} key có dữ liệu)`);
      }
      console.log('==================================================\n');
    } catch (error) {
      console.error('[StorageLogger] Lỗi khi đọc SecureStore:', error);
    }
  },

  /**
   * Log toàn bộ các bảng và dữ liệu trong SQLite ra console ngay ngắn.
   */
  async logSQLite(): Promise<void> {
    try {
      const db = getRawDatabase();
      const tablesResult = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'drizzle_%';",
      );

      console.log('\n==================================================');
      console.log(`🗄️ [SQLite Database] Số bảng tìm thấy: ${tablesResult.length}`);
      console.log('==================================================');

      if (tablesResult.length === 0) {
        console.log('(Không có bảng dữ liệu nào trong SQLite)');
        console.log('--------------------------------------------------\n');
        return;
      }

      for (const { name: tableName } of tablesResult) {
        const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM "${tableName}";`);
        console.log(`\n📋 Bảng: "${tableName}" (${rows.length} bản ghi)`);
        if (rows.length > 0) {
          console.table ? console.table(rows) : console.log(JSON.stringify(rows, null, 2));
        } else {
          console.log('(Bảng trống)');
        }
      }
      console.log('\n==================================================\n');
    } catch (error) {
      console.error('[StorageLogger] Lỗi khi đọc SQLite:', error);
    }
  },

  /**
   * Log tất cả storage (AsyncStorage, SecureStore, SQLite) theo thứ tự.
   */
  async logAll(): Promise<void> {
    console.log('\n🚀 >>> DUMP TOÀN BỘ BỘ NHỚ THIẾT BỊ (STORAGE DUMP) <<< 🚀');
    await this.logAsyncStorage();
    await this.logSecureStore();
    await this.logSQLite();
    console.log('🏁 >>> KẾT THÚC DUMP BỘ NHỚ <<< 🏁\n');
  },
};

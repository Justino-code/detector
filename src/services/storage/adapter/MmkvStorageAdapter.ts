import { createMMKV } from 'react-native-mmkv'
import { StorageAdapter } from '../../../types/storage/storage';

const mmkv = createMMKV({
  id: 'plant_detector_storage',
});

export class MMKVStorageAdapter implements StorageAdapter {
  async setItem(key: string, value: string): Promise<void> {
    mmkv.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return mmkv.getString(key) ?? null;
  }

  async removeItem(key: string): Promise<void> {
    mmkv.remove(key);
  }
}

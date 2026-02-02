import { MMKV } from 'react-native-mmkv';
import { StorageAdapter } from '../../types/storage/storage';

const mmkv = new MMKV({
  id: 'plant_detector_storage',
});

export class MMKVStorage implements StorageAdapter {
  async setItem(key: string, value: string): Promise<void> {
    mmkv.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return mmkv.getString(key) ?? null;
  }

  async removeItem(key: string): Promise<void> {
    mmkv.delete(key);
  }
}

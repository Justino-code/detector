import { MMKVStorage } from './MmkvStorage';
import { AsyncStorageAdapter } from './AsyncStorageAdapter';

// escolha centralizada
const USE_MMKV = true;

export const storage = USE_MMKV
  ? new MMKVStorage()
  : new AsyncStorageAdapter();

export { MMKVStorage, AsyncStorageAdapter };

import { MMKVStorage } from './MMKVStorage';
import { AsyncStorageAdapter } from './AsyncStorageAdapter';

// escolha centralizada
const USE_MMKV = true;

export const storage = USE_MMKV
  ? new MMKVStorage()
  : new AsyncStorageAdapter();

export { MMKVStorage, AsyncStorageAdapter };

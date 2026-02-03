import { 
  AsyncStorageAdapter,
  MMKVStorageAdapter,
  StorageAdapter,
  StorageType,
 } from './adapter';

export class StorageFactory {
  static create(type: StorageType = StorageType.MMKV): StorageAdapter {
    if (type === StorageType.MMKV) {
      return new MMKVStorageAdapter();
    }
    return new AsyncStorageAdapter();
  }
}

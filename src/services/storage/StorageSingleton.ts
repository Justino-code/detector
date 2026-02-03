// StorageSingleton.ts
import { StorageAdapter } from "./adapter";
import { StorageFactory } from "./StorageFactory";

class StorageSingleton {
  private static instance: StorageAdapter;

  static getInstance(): StorageAdapter {
    if (!this.instance) {
      this.instance = StorageFactory.create();
    }
    return this.instance;
  }
}

export const storage = StorageSingleton.getInstance();

import {
  DB_NAME,
  DB_VERSION,
  DB_STORES,
  type DbStoreName,
  type StoreEntityMap,
  type BaseEntity,
} from "./schema";

const DB_CHANGE_EVENT = "plan0-db-change";

let dbInstancePromise: Promise<IDBDatabase> | null = null;

function isIndexedDbSupported(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

/**
 * Opens or returns the singleton IndexedDB connection.
 */
export function openDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDbSupported()) {
    return Promise.reject(new Error("IndexedDB is not supported in this environment"));
  }

  if (dbInstancePromise) {
    return dbInstancePromise;
  }

  dbInstancePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't already exist
      for (const storeName of Object.values(DB_STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: "id" });
          if (storeName === DB_STORES.MEDICAL_NOTES) {
            store.createIndex("by_member", "memberId", { unique: false });
          }
        }
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbInstancePromise = null;
      };
      resolve(db);
    };

    request.onerror = () => {
      dbInstancePromise = null;
      reject(request.error || new Error("Failed to open IndexedDB"));
    };

    request.onblocked = () => {
      // Another connection is blocking upgrade
    };
  });

  return dbInstancePromise;
}

/**
 * Retrieves all items from a given store.
 */
export async function getAllFromStore<K extends DbStoreName>(
  storeName: K,
): Promise<StoreEntityMap[K][]> {
  if (!isIndexedDbSupported()) return [];
  try {
    const db = await openDatabase();
    return await new Promise<StoreEntityMap[K][]>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as StoreEntityMap[K][]);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn(`[LocalDB] Error reading from store ${storeName}:`, error);
    return [];
  }
}

/**
 * Retrieves a single item by key from a given store.
 */
export async function getFromStore<K extends DbStoreName>(
  storeName: K,
  id: string,
): Promise<StoreEntityMap[K] | undefined> {
  if (!isIndexedDbSupported()) return undefined;
  try {
    const db = await openDatabase();
    return await new Promise<StoreEntityMap[K] | undefined>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as StoreEntityMap[K] | undefined);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn(`[LocalDB] Error reading item ${id} from store ${storeName}:`, error);
    return undefined;
  }
}

/**
 * Saves or updates an item in a given store.
 */
export async function putInStore<K extends DbStoreName>(
  storeName: K,
  item: StoreEntityMap[K],
): Promise<void> {
  if (!isIndexedDbSupported()) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    notifyDatabaseChange(storeName);
  } catch (error) {
    console.warn(`[LocalDB] Error putting item into store ${storeName}:`, error);
  }
}

/**
 * Saves multiple items into a given store in a single transaction.
 */
export async function putManyInStore<K extends DbStoreName>(
  storeName: K,
  items: StoreEntityMap[K][],
): Promise<void> {
  if (!isIndexedDbSupported() || items.length === 0) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      for (const item of items) {
        store.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    notifyDatabaseChange(storeName);
  } catch (error) {
    console.warn(`[LocalDB] Error saving batch to store ${storeName}:`, error);
  }
}

/**
 * Deletes an item by key from a given store.
 */
export async function deleteFromStore<K extends DbStoreName>(
  storeName: K,
  id: string,
): Promise<void> {
  if (!isIndexedDbSupported()) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    notifyDatabaseChange(storeName);
  } catch (error) {
    console.warn(`[LocalDB] Error deleting item ${id} from store ${storeName}:`, error);
  }
}

/**
 * Clears an entire object store.
 */
export async function clearStore<K extends DbStoreName>(storeName: K): Promise<void> {
  if (!isIndexedDbSupported()) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    notifyDatabaseChange(storeName);
  } catch (error) {
    console.warn(`[LocalDB] Error clearing store ${storeName}:`, error);
  }
}

/**
 * Clears all data stores in the offline database and clears related local storage keys.
 */
export async function clearAllOfflineData(): Promise<void> {
  if (isIndexedDbSupported()) {
    try {
      const db = await openDatabase();
      const storeNames = Object.values(DB_STORES);
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeNames, "readwrite");
        for (const name of storeNames) {
          transaction.objectStore(name).clear();
        }
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.warn("[LocalDB] Error clearing IndexedDB stores:", error);
    }
  }

  // Clear specific household offline data from localStorage as well
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("plan-0-supplies-v1");
      window.localStorage.removeItem("plan-0-medical-profiles-v1");
      window.localStorage.removeItem("plan-0-medical-notes-v1");
      window.localStorage.removeItem("plan-0-emergency-contacts-v1");
      window.localStorage.removeItem("plan-0-emergency-mode-active");
    } catch {
      // Storage unavailable
    }

    window.dispatchEvent(new Event("plan-0-medical-profiles-change"));
    window.dispatchEvent(new Event("plan-0-medical-notes-change"));
    window.dispatchEvent(new Event("plan-0-supplies-change"));
    window.dispatchEvent(new Event("plan-0-emergency-contacts-change"));
  }

  // Broadcast global DB change
  notifyDatabaseChange();
}

/**
 * Notifies all subscribers about a change in database state.
 */
export function notifyDatabaseChange(storeName?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(DB_CHANGE_EVENT, {
      detail: { storeName },
    }),
  );
}

/**
 * Subscribes to database changes.
 */
export function subscribeToDatabase(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => listener();
  window.addEventListener(DB_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(DB_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export * from "./schema";

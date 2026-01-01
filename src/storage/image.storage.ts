export type ImageAsset = {
  id: string;
  blob: Blob;
  createdAt: number;
};

export interface ImageStorage {
  save(file: File): Promise<string>; // returns imageId
  get(id: string): Promise<Blob | null>;
  delete(id: string): Promise<void>;
}

const DB_NAME = "bcms-assets";
const STORE = "images";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const imageStorage: ImageStorage = {
  async save(file) {
    const db = await openDB();
    const id = crypto.randomUUID();

    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({
      id,
      blob: file,
      createdAt: Date.now(),
    });

    return id;
  },

  async get(id) {
    const db = await openDB();
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result?.blob ?? null);
      };
      request.onerror = () => resolve(null);
    });
  },

  async delete(id) {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
  },
};

import type { AppraisalRecord, HistoryFilter } from '@/types/appraisal';

const DB_NAME = 'figure_appraisal_db';
const DB_VERSION = 1;
const STORE_NAME = 'appraisal_history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('gradeLevel', 'gradeLevel', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('weightedScore', 'weightedScore', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addRecord(record: AppraisalRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function updateRecord(record: AppraisalRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getRecord(id: string): Promise<AppraisalRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as AppraisalRecord | undefined);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getAllRecords(): Promise<AppraisalRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as AppraisalRecord[]);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getFilteredRecords(
  filter: HistoryFilter
): Promise<AppraisalRecord[]> {
  const all = await getAllRecords();
  let filtered = all;

  if (filter.category && filter.category !== 'all') {
    filtered = filtered.filter((r) => r.category === filter.category);
  }

  if (filter.grade && filter.grade !== 'all') {
    filtered = filtered.filter((r) => r.gradeLevel === filter.grade);
  }

  if (filter.keyword && filter.keyword.trim()) {
    const kw = filter.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        (r.note && r.note.toLowerCase().includes(kw))
    );
  }

  filtered.sort((a, b) => {
    let cmp = 0;
    switch (filter.sortField) {
      case 'createdAt':
        cmp = a.createdAt - b.createdAt;
        break;
      case 'weightedScore':
        cmp = a.weightedScore - b.weightedScore;
        break;
      case 'name':
        cmp = a.name.localeCompare(b.name, 'zh-CN');
        break;
    }
    return filter.sortOrder === 'desc' ? -cmp : cmp;
  });

  return filtered;
}

export function generateRecordId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

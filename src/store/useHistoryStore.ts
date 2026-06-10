import { create } from 'zustand';
import type {
  AppraisalRecord,
  HistoryFilter,
  SortField,
  SortOrder,
} from '@/types/appraisal';
import {
  addRecord,
  deleteRecord,
  getFilteredRecords,
  getRecord,
  updateRecord,
} from '@/db/historyDB';

interface HistoryStore {
  records: AppraisalRecord[];
  loading: boolean;
  filter: HistoryFilter;
  selectedIds: string[];
  compareMode: boolean;

  fetchRecords: () => Promise<void>;
  fetchRecordById: (id: string) => Promise<AppraisalRecord | undefined>;
  addNewRecord: (record: AppraisalRecord) => Promise<void>;
  updateRecordNote: (id: string, note: string) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  removeSelected: () => Promise<void>;

  setFilter: (filter: Partial<HistoryFilter>) => void;
  setSort: (field: SortField, order: SortOrder) => void;

  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setCompareMode: (enabled: boolean) => void;

  exportToJSON: () => string;
}

const defaultFilter: HistoryFilter = {
  category: 'all',
  grade: 'all',
  keyword: '',
  sortField: 'createdAt',
  sortOrder: 'desc',
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  records: [],
  loading: true,
  filter: defaultFilter,
  selectedIds: [],
  compareMode: false,

  fetchRecords: async () => {
    set({ loading: true });
    try {
      const records = await getFilteredRecords(get().filter);
      set({ records, loading: false });
    } catch (e) {
      set({ loading: false });
      console.error('Failed to fetch records:', e);
    }
  },

  fetchRecordById: async (id) => {
    return getRecord(id);
  },

  addNewRecord: async (record) => {
    await addRecord(record);
    get().fetchRecords();
  },

  updateRecordNote: async (id, note) => {
    const existing = await getRecord(id);
    if (!existing) return;
    const updated = { ...existing, note, updatedAt: Date.now() };
    await updateRecord(updated);
    get().fetchRecords();
  },

  removeRecord: async (id) => {
    await deleteRecord(id);
    set((state) => ({
      selectedIds: state.selectedIds.filter((x) => x !== id),
    }));
    get().fetchRecords();
  },

  removeSelected: async () => {
    const ids = [...get().selectedIds];
    for (const id of ids) {
      await deleteRecord(id);
    }
    set({ selectedIds: [] });
    get().fetchRecords();
  },

  setFilter: (partial) => {
    set((state) => ({ filter: { ...state.filter, ...partial } }));
    get().fetchRecords();
  },

  setSort: (field, order) => {
    set((state) => ({
      filter: { ...state.filter, sortField: field, sortOrder: order },
    }));
    get().fetchRecords();
  },

  toggleSelect: (id) => {
    set((state) => {
      const exists = state.selectedIds.includes(id);
      let next: string[];
      if (exists) {
        next = state.selectedIds.filter((x) => x !== id);
      } else {
        next = state.compareMode
          ? state.selectedIds.length >= 2
            ? state.selectedIds
            : [...state.selectedIds, id]
          : [...state.selectedIds, id];
      }
      return { selectedIds: next };
    });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  setCompareMode: (enabled) => {
    set({ compareMode: enabled, selectedIds: enabled ? [] : get().selectedIds });
  },

  exportToJSON: () => {
    const { records } = get();
    const data = {
      exportedAt: new Date().toISOString(),
      count: records.length,
      records,
    };
    return JSON.stringify(data, null, 2);
  },
}));

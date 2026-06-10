import { useEffect, useCallback } from 'react';
import type { AppraisalFormState, DraftStorage } from '@/types/appraisal';

const DRAFT_STORAGE_KEY = 'figure_appraisal_draft';
const DRAFT_EXPIRE_DAYS = 7;

const DRAFT_EXPIRE_MS = DRAFT_EXPIRE_DAYS * 24 * 60 * 60 * 1000;

export function saveDraft(state: AppraisalFormState): void {
  try {
    const now = Date.now();
    const storage: DraftStorage = {
      state,
      savedAt: now,
      expiresAt: now + DRAFT_EXPIRE_MS,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    console.error('保存草稿失败:', e);
  }
}

export function loadDraft(): AppraisalFormState | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const storage: DraftStorage = JSON.parse(raw);
    const now = Date.now();

    if (now > storage.expiresAt) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }

    return storage.state;
  } catch (e) {
    console.error('读取草稿失败:', e);
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (e) {
    console.error('清除草稿失败:', e);
  }
}

export function formatDraftTime(timestamp: number | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function useDraftStorage(
  state: AppraisalFormState,
  onRestore: (state: AppraisalFormState) => void
): { clear: () => void } {
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      onRestore(draft);
    }
  }, [onRestore]);

  useEffect(() => {
    const hasContent = Object.values(state.scores).some((v) => v !== null && v !== undefined);
    if (hasContent) {
      saveDraft({ ...state, draftSavedAt: Date.now() });
    }
  }, [state]);

  const clear = useCallback(() => {
    clearDraft();
  }, []);

  return { clear };
}

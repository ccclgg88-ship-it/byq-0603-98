import { create } from 'zustand';
import type { AppraisalFormState, FigureCategory } from '@/types/appraisal';
import { filterStateByCategory, getDimensionsByCategory } from '@/utils/scoring';
import { validateScore, validateAllScores } from '@/utils/validation';

interface AppraisalStore extends AppraisalFormState {
  setCategory: (category: FigureCategory) => void;
  setScore: (key: string, value: number | null) => void;
  setError: (key: string, error: string) => void;
  validateField: (key: string) => void;
  validateAll: () => boolean;
  restoreState: (state: AppraisalFormState) => void;
  clearDraftTime: () => void;
  reset: () => void;
}

const initialState: AppraisalFormState = {
  category: 'scale',
  scores: {},
  errors: {},
  draftSavedAt: null,
};

export const useAppraisalStore = create<AppraisalStore>((set, get) => ({
  ...initialState,

  setCategory: (category) => {
    const current = get();
    const filtered = filterStateByCategory(current, category);
    set(filtered);
  },

  setScore: (key, value) => {
    set((state) => ({
      scores: { ...state.scores, [key]: value },
      errors: { ...state.errors, [key]: '' },
    }));

    const state = get();
    const dimensions = getDimensionsByCategory(state.category);
    const dim = dimensions.find((d) => d.key === key);
    if (dim) {
      const error = validateScore(value, dim);
      if (error) {
        set((s) => ({ errors: { ...s.errors, [key]: error } }));
      }
    }
  },

  setError: (key, error) => {
    set((state) => ({
      errors: { ...state.errors, [key]: error },
    }));
  },

  validateField: (key) => {
    const state = get();
    const dimensions = getDimensionsByCategory(state.category);
    const dim = dimensions.find((d) => d.key === key);
    if (!dim) return;

    const error = validateScore(state.scores[key] ?? null, dim);
    set((s) => ({ errors: { ...s.errors, [key]: error } }));
  },

  validateAll: () => {
    const state = get();
    const dimensions = getDimensionsByCategory(state.category);
    const errors = validateAllScores(state.scores, dimensions);
    set({ errors });
    return Object.keys(errors).length === 0;
  },

  restoreState: (state) => {
    set(state);
  },

  clearDraftTime: () => {
    set({ draftSavedAt: null });
  },

  reset: () => {
    set({ ...initialState });
  },
}));

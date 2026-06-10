import { create } from 'zustand';
import type { AppraisalFormState, FigureCategory } from '@/types/appraisal';
import { filterStateByCategory, getDimensionsByCategory } from '@/utils/scoring';
import { validateScore, validateAllScores } from '@/utils/validation';

interface AppraisalStore extends AppraisalFormState {
  submitted: boolean;
  setCategory: (category: FigureCategory) => void;
  setScore: (key: string, value: number | null) => void;
  setError: (key: string, error: string) => void;
  validateField: (key: string) => void;
  validateAll: () => boolean;
  restoreState: (state: AppraisalFormState) => void;
  clearDraftTime: () => void;
  setSubmitted: (value: boolean) => void;
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
  submitted: false,

  setCategory: (category) => {
    const current = get();
    const filtered = filterStateByCategory(current, category);
    set(filtered);
  },

  setScore: (key, value) => {
    let dim;
    set((state) => {
      const dimensions = getDimensionsByCategory(state.category);
      dim = dimensions.find((d) => d.key === key);
      const nextErrors = { ...state.errors };
      if (dim) {
        const err = validateScore(value, dim);
        nextErrors[key] = err;
      } else {
        nextErrors[key] = '';
      }
      return {
        scores: { ...state.scores, [key]: value },
        errors: nextErrors,
      };
    });
  },

  setError: (key, error) => {
    set((state) => ({
      errors: { ...state.errors, [key]: error },
    }));
  },

  validateField: (key) => {
    set((state) => {
      const dimensions = getDimensionsByCategory(state.category);
      const dim = dimensions.find((d) => d.key === key);
      if (!dim) return state;
      const error = validateScore(state.scores[key] ?? null, dim);
      return {
        errors: { ...state.errors, [key]: error },
      };
    });
  },

  validateAll: () => {
    let isValid = false;
    set((state) => {
      const dimensions = getDimensionsByCategory(state.category);
      const errors = validateAllScores(state.scores, dimensions);
      isValid = Object.keys(errors).length === 0;
      return { errors };
    });
    return isValid;
  },

  restoreState: (state) => {
    set({ ...state, submitted: false });
  },

  clearDraftTime: () => {
    set({ draftSavedAt: null });
  },

  setSubmitted: (value) => {
    set({ submitted: value });
  },

  reset: () => {
    set({ ...initialState, submitted: false });
  },
}));

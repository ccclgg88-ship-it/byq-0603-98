import { create } from 'zustand';
import type {
  AppraisalFormState,
  AppraisalRecord,
  FigureCategory,
} from '@/types/appraisal';
import {
  filterStateByCategory,
  getDimensionsByCategory,
  calculateWeightedScore,
  getGradeLevel,
} from '@/utils/scoring';
import { validateScore, validateAllScores } from '@/utils/validation';
import { generateRecordId } from '@/db/historyDB';

interface AppraisalStore extends AppraisalFormState {
  name: string;
  submitted: boolean;
  setName: (name: string) => void;
  setCategory: (category: FigureCategory) => void;
  setScore: (key: string, value: number | null) => void;
  setError: (key: string, error: string) => void;
  validateField: (key: string) => void;
  validateAll: () => boolean;
  restoreState: (state: AppraisalFormState) => void;
  clearDraftTime: () => void;
  setSubmitted: (value: boolean) => void;
  buildRecord: () => AppraisalRecord;
  reset: () => void;
}

const initialState: AppraisalFormState & { name: string } = {
  category: 'scale',
  name: '',
  scores: {},
  errors: {},
  draftSavedAt: null,
};

export const useAppraisalStore = create<AppraisalStore>((set, get) => ({
  ...initialState,
  submitted: false,

  setName: (name) => set({ name }),

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

  buildRecord: () => {
    const state = get();
    const dimensions = getDimensionsByCategory(state.category);
    const weightedScore = calculateWeightedScore(state.scores, dimensions);
    const gradeLevel = getGradeLevel(weightedScore);

    const scores: Record<string, number> = {};
    for (const dim of dimensions) {
      const val = state.scores[dim.key];
      scores[dim.key] = val ?? 0;
    }

    const now = Date.now();
    const displayName = state.name.trim() || `未命名手办 ${new Date(now).toLocaleDateString('zh-CN')}`;

    return {
      id: generateRecordId(),
      name: displayName,
      category: state.category,
      scores,
      weightedScore,
      gradeLevel,
      dimensions,
      note: '',
      createdAt: now,
      updatedAt: now,
    };
  },

  reset: () => {
    set({ ...initialState, submitted: false });
  },
}));

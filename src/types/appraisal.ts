export type FigureCategory = 'prize' | 'scale' | 'action';

export interface Dimension {
  key: string;
  label: string;
  description: string;
  weight: number;
  required: boolean;
  categories: FigureCategory[];
}

export interface CategoryConfig {
  name: string;
  description: string;
}

export interface ScoringConfig {
  categories: Record<FigureCategory, CategoryConfig>;
  dimensions: Dimension[];
  gradeThresholds: {
    masterpiece: number;
    good: number;
  };
}

export type GradeLevel = 'masterpiece' | 'good' | 'normal';

export interface AppraisalFormState {
  category: FigureCategory;
  scores: Record<string, number | null>;
  errors: Record<string, string>;
  draftSavedAt: number | null;
}

export interface DraftStorage {
  state: AppraisalFormState;
  savedAt: number;
  expiresAt: number;
}

export interface GradeConfig {
  label: string;
  color: string;
  bgColor: string;
  glowColor: string;
  description: string;
}

export interface AppraisalRecord {
  id: string;
  name: string;
  category: FigureCategory;
  scores: Record<string, number>;
  weightedScore: number;
  gradeLevel: GradeLevel;
  dimensions: Dimension[];
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export type SortField = 'createdAt' | 'weightedScore' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface HistoryFilter {
  category?: FigureCategory | 'all';
  grade?: GradeLevel | 'all';
  keyword?: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

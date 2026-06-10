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

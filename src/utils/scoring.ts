import type { Dimension, FigureCategory, GradeLevel, GradeConfig, AppraisalFormState } from '@/types/appraisal';
import scoringConfig from '@/config/scoring.config.json';

export const GRADE_CONFIGS: Record<GradeLevel, GradeConfig> = {
  masterpiece: {
    label: '神作',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.15)',
    glowColor: '0 0 40px rgba(255, 215, 0, 0.5)',
    description: '收藏级品质，品相极佳',
  },
  good: {
    label: '良品',
    color: '#4ADE80',
    bgColor: 'rgba(74, 222, 128, 0.15)',
    glowColor: '0 0 40px rgba(74, 222, 128, 0.4)',
    description: '品相良好，值得入手',
  },
  normal: {
    label: '一般',
    color: '#9CA3AF',
    bgColor: 'rgba(156, 163, 175, 0.15)',
    glowColor: '0 0 40px rgba(156, 163, 175, 0.3)',
    description: '品相普通，建议谨慎',
  },
};

export function getDimensionsByCategory(category: FigureCategory): Dimension[] {
  return scoringConfig.dimensions.filter((d) => d.categories.includes(category));
}

export function calculateWeightedScore(
  scores: Record<string, number | null>,
  dimensions: Dimension[]
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const dim of dimensions) {
    const score = scores[dim.key];
    if (score !== null && score !== undefined) {
      weightedSum += (score / 10) * 100 * dim.weight;
      totalWeight += dim.weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function getGradeLevel(score: number): GradeLevel {
  const { masterpiece, good } = scoringConfig.gradeThresholds;
  if (score >= masterpiece) return 'masterpiece';
  if (score >= good) return 'good';
  return 'normal';
}

export function getRadarData(
  scores: Record<string, number | null>,
  dimensions: Dimension[]
): Array<{ dimension: string; score: number; fullMark: number }> {
  return dimensions.map((dim) => ({
    dimension: dim.label,
    score: scores[dim.key] ?? 0,
    fullMark: 10,
  }));
}

export function getApplicableDimensionKeys(category: FigureCategory): Set<string> {
  return new Set(getDimensionsByCategory(category).map((d) => d.key));
}

export function filterStateByCategory(
  state: AppraisalFormState,
  category: FigureCategory
): AppraisalFormState {
  const applicableKeys = getApplicableDimensionKeys(category);
  const filteredScores: Record<string, number | null> = {};
  const filteredErrors: Record<string, string> = {};

  for (const key of Object.keys(state.scores)) {
    if (applicableKeys.has(key)) {
      filteredScores[key] = state.scores[key];
    }
  }

  for (const key of Object.keys(state.errors)) {
    if (applicableKeys.has(key)) {
      filteredErrors[key] = state.errors[key];
    }
  }

  return {
    ...state,
    category,
    scores: filteredScores,
    errors: filteredErrors,
  };
}

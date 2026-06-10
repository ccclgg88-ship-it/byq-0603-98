import type { Dimension } from '@/types/appraisal';

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;

export function validateScore(value: number | null, dimension: Dimension): string {
  if (value === null || value === undefined) {
    if (dimension.required) {
      return `${dimension.label}为必填项`;
    }
    return '';
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '请输入有效数字';
  }

  if (value < MIN_SCORE || value > MAX_SCORE) {
    return `分数需在 ${MIN_SCORE}–${MAX_SCORE} 之间`;
  }

  return '';
}

export function validateAllScores(
  scores: Record<string, number | null>,
  dimensions: Dimension[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const dim of dimensions) {
    const error = validateScore(scores[dim.key] ?? null, dim);
    if (error) {
      errors[dim.key] = error;
    }
  }

  return errors;
}

export function parseScoreInput(input: string): number | null {
  if (input.trim() === '') return null;
  const num = Number(input);
  return Number.isNaN(num) ? null : num;
}

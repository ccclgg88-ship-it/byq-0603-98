import { useMemo } from 'react';
import { useAppraisalStore } from '@/store/useAppraisalStore';
import { getDimensionsByCategory } from '@/utils/scoring';
import { GradeBadgeDisplay } from './GradeBadgeDisplay';

export function GradeBadge() {
  const { category, scores } = useAppraisalStore();
  const dimensions = useMemo(() => getDimensionsByCategory(category), [category]);

  return <GradeBadgeDisplay scores={scores} dimensions={dimensions} />;
}

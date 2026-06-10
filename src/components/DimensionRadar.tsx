import { useMemo } from 'react';
import { useAppraisalStore } from '@/store/useAppraisalStore';
import { getDimensionsByCategory } from '@/utils/scoring';
import { DimensionRadarDisplay } from './DimensionRadarDisplay';

export function DimensionRadar() {
  const { category, scores } = useAppraisalStore();
  const dimensions = useMemo(() => getDimensionsByCategory(category), [category]);

  return <DimensionRadarDisplay scores={scores} dimensions={dimensions} />;
}

import { useMemo } from 'react';
import { Sparkles, ThumbsUp, Meh } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppraisalStore } from '@/store/useAppraisalStore';
import {
  GRADE_CONFIGS,
  calculateWeightedScore,
  getGradeLevel,
  getDimensionsByCategory,
} from '@/utils/scoring';
import scoringConfig from '@/config/scoring.config.json';

const GRADE_ICONS = {
  masterpiece: <Sparkles className="w-8 h-8" />,
  good: <ThumbsUp className="w-8 h-8" />,
  normal: <Meh className="w-8 h-8" />,
};

export function GradeBadge() {
  const { category, scores } = useAppraisalStore();

  const dimensions = useMemo(() => getDimensionsByCategory(category), [category]);
  const weightedScore = useMemo(
    () => calculateWeightedScore(scores, dimensions),
    [scores, dimensions]
  );
  const gradeLevel = useMemo(() => getGradeLevel(weightedScore), [weightedScore]);
  const config = GRADE_CONFIGS[gradeLevel];

  const hasScores = Object.values(scores).some((v) => v !== null && v !== undefined);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-6 w-full justify-center">
        <div
          className={twMerge(
            'relative flex flex-col items-center justify-center',
            'w-36 h-36 sm:w-44 sm:h-44 rounded-full',
            'border-2 transition-all duration-500 ease-out',
            hasScores ? 'animate-pop-in' : ''
          )}
          style={{
            borderColor: config.color,
            backgroundColor: config.bgColor,
            boxShadow: hasScores ? config.glowColor : 'none',
          }}
        >
          <div
            className="absolute inset-2 rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${config.color}40 0%, transparent 70%)`,
            }}
          />
          <div
            className="relative z-10 flex flex-col items-center gap-1"
            style={{ color: config.color }}
          >
            {GRADE_ICONS[gradeLevel]}
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {hasScores ? weightedScore : '--'}
            </div>
            <div className="text-xs sm:text-sm opacity-80">加权总分</div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          <div
            className="text-3xl sm:text-4xl font-black tracking-wider"
            style={{
              color: config.color,
              textShadow: hasScores ? `0 0 20px ${config.color}60` : 'none',
            }}
          >
            {config.label}
          </div>
          <div className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-[160px]">
            {config.description}
          </div>
          <div className="text-[10px] text-gray-600 leading-relaxed">
            ≥ {scoringConfig.gradeThresholds.masterpiece} 神作 ·{' '}
            {scoringConfig.gradeThresholds.good}–
            {scoringConfig.gradeThresholds.masterpiece - 1} 良品 ·{' '}
            {'<'} {scoringConfig.gradeThresholds.good} 一般
          </div>
        </div>
      </div>
    </div>
  );
}

import { Sparkles, ThumbsUp, Meh } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import {
  GRADE_CONFIGS,
  calculateWeightedScore,
  getGradeLevel,
} from '@/utils/scoring';
import scoringConfig from '@/config/scoring.config.json';
import type { Dimension, GradeLevel } from '@/types/appraisal';

const GRADE_ICONS: Record<GradeLevel, React.ReactNode> = {
  masterpiece: <Sparkles className="w-8 h-8" />,
  good: <ThumbsUp className="w-8 h-8" />,
  normal: <Meh className="w-8 h-8" />,
};

interface GradeBadgeDisplayProps {
  scores: Record<string, number | null>;
  dimensions: Dimension[];
  title?: string;
}

export function GradeBadgeDisplay({
  scores,
  dimensions,
  title = '鉴定等级',
}: GradeBadgeDisplayProps) {
  const weightedScore = calculateWeightedScore(scores, dimensions);
  const gradeLevel = getGradeLevel(weightedScore);
  const config = GRADE_CONFIGS[gradeLevel];

  const hasScores = Object.values(scores).some(
    (v) => v !== null && v !== undefined
  );

  const displayScore = hasScores ? weightedScore.toFixed(1) : '--';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-sm font-semibold text-pink-200 tracking-wide">
          {title}
        </h3>
        <span className="text-xs text-gray-500">满分 100</span>
      </div>

      <div
        className={twMerge(
          'relative flex flex-col sm:flex-row items-center justify-center gap-6 w-full py-4',
          hasScores ? 'animate-pop-in' : ''
        )}
      >
        <div
          className="relative flex flex-col items-center justify-center shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 transition-all duration-500 ease-out"
          style={{
            borderColor: config.color,
            backgroundColor: config.bgColor,
            boxShadow: hasScores ? config.glowColor : 'none',
          }}
          aria-label={`当前分数 ${displayScore}，等级 ${config.label}`}
        >
          <div
            className="absolute inset-2 rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${config.color}40 0%, transparent 70%)`,
            }}
          />
          <div
            className="relative z-10 flex flex-col items-center gap-0.5"
            style={{ color: config.color }}
          >
            <div className="mb-1">{GRADE_ICONS[gradeLevel]}</div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              {displayScore}
            </div>
            <div className="text-[10px] sm:text-xs opacity-75 mt-1">加权总分</div>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start gap-2 max-w-[180px]">
          <div
            className="text-3xl sm:text-4xl font-black tracking-wider"
            style={{
              color: config.color,
              textShadow: hasScores ? `0 0 20px ${config.color}60` : 'none',
            }}
          >
            {config.label}
          </div>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-center sm:text-left">
            {config.description}
          </p>
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

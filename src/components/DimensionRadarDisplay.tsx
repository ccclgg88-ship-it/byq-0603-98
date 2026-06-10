import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { getRadarData } from '@/utils/scoring';
import type { Dimension } from '@/types/appraisal';

interface DimensionRadarDisplayProps {
  scores: Record<string, number | null>;
  dimensions: Dimension[];
  title?: string;
  colorScheme?: 'pink' | 'cyan' | 'amber';
}

const COLOR_SCHEMES = {
  pink: {
    stroke: '#FF6B9D',
    fillStart: '#FF6B9D',
    fillEnd: '#A855F7',
    tick: '#E879F9',
    dot: '#FF6B9D',
    activeDot: '#D946EF',
    cursor: '#FF6B9D',
    gradientId: 'radarFillGradientPink',
  },
  cyan: {
    stroke: '#22D3EE',
    fillStart: '#22D3EE',
    fillEnd: '#6366F1',
    tick: '#67E8F9',
    dot: '#22D3EE',
    activeDot: '#06B6D4',
    cursor: '#22D3EE',
    gradientId: 'radarFillGradientCyan',
  },
  amber: {
    stroke: '#FBBF24',
    fillStart: '#FBBF24',
    fillEnd: '#F97316',
    tick: '#FDE68A',
    dot: '#FBBF24',
    activeDot: '#F59E0B',
    cursor: '#FBBF24',
    gradientId: 'radarFillGradientAmber',
  },
};

export function DimensionRadarDisplay({
  scores,
  dimensions,
  title = '维度雷达图',
  colorScheme = 'pink',
}: DimensionRadarDisplayProps) {
  const colors = COLOR_SCHEMES[colorScheme];
  const data = useMemo(() => getRadarData(scores, dimensions), [scores, dimensions]);

  const hasScores = Object.values(scores).some(
    (v) => v !== null && v !== undefined
  );

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-pink-200 tracking-wide">
          {title}
        </h3>
        <span className="text-xs text-gray-500">满分 10 分</span>
      </div>

      <div
        className="w-full"
        style={{ height: dimensions.length <= 4 ? 280 : 340, minHeight: 280 }}
      >
        {dimensions.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={dimensions.length <= 4 ? '75%' : '70%'}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <defs>
                <linearGradient id={colors.gradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={colors.fillStart} stopOpacity={0.7} />
                  <stop offset="50%" stopColor={colors.fillEnd} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={colors.fillEnd} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <PolarGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{
                  fill: colors.tick,
                  fontSize: dimensions.length > 4 ? 11 : 12,
                  fontWeight: 500,
                }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fill: '#6B7280', fontSize: 10 }}
                tickCount={3}
                axisLine={false}
                tickLine={false}
              />
              <Radar
                name="得分"
                dataKey="score"
                stroke={colors.stroke}
                strokeWidth={2}
                fill={`url(#${colors.gradientId})`}
                fillOpacity={hasScores ? 0.55 : 0.08}
                animationDuration={600}
                animationEasing="ease-out"
                dot={
                  hasScores
                    ? {
                        r: 4,
                        fill: colors.dot,
                        stroke: '#fff',
                        strokeWidth: 1.5,
                      }
                    : false
                }
                activeDot={
                  hasScores
                    ? {
                        r: 6,
                        fill: colors.activeDot,
                        stroke: '#fff',
                        strokeWidth: 2,
                      }
                    : false
                }
              />
              <Tooltip
                cursor={{ stroke: colors.cursor, strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(26, 10, 46, 0.95)',
                  border: `1px solid ${colors.stroke}4D`,
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                formatter={(value: number) => [`${value} / 10`, '得分']}
                labelStyle={{
                  color: colors.tick,
                  marginBottom: '4px',
                  fontWeight: 600,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
                iconSize={8}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            暂无评分维度
          </div>
        )}
      </div>
    </div>
  );
}

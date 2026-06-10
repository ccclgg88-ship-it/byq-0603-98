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
import { useAppraisalStore } from '@/store/useAppraisalStore';
import { getDimensionsByCategory, getRadarData } from '@/utils/scoring';

export function DimensionRadar() {
  const { category, scores } = useAppraisalStore();

  const dimensions = useMemo(() => getDimensionsByCategory(category), [category]);
  const data = useMemo(() => getRadarData(scores, dimensions), [scores, dimensions]);

  const hasScores = Object.values(scores).some(
    (v) => v !== null && v !== undefined
  );

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-pink-200 tracking-wide">
          维度雷达图
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
                <linearGradient id="radarFillGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF6B9D" stopOpacity={0.7} />
                  <stop offset="50%" stopColor="#D946EF" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <PolarGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{
                  fill: '#E879F9',
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
                stroke="#FF6B9D"
                strokeWidth={2}
                fill="url(#radarFillGradient)"
                fillOpacity={hasScores ? 0.55 : 0.08}
                animationDuration={600}
                animationEasing="ease-out"
                dot={
                  hasScores
                    ? {
                        r: 4,
                        fill: '#FF6B9D',
                        stroke: '#fff',
                        strokeWidth: 1.5,
                      }
                    : false
                }
                activeDot={
                  hasScores
                    ? {
                        r: 6,
                        fill: '#D946EF',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }
                    : false
                }
              />
              <Tooltip
                cursor={{ stroke: '#FF6B9D', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(26, 10, 46, 0.95)',
                  border: '1px solid rgba(255, 107, 157, 0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                formatter={(value: number) => [`${value} / 10`, '得分']}
                labelStyle={{
                  color: '#E879F9',
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

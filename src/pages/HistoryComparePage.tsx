import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
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
import type { AppraisalRecord, Dimension } from '@/types/appraisal';
import { getRecord } from '@/db/historyDB';
import { GRADE_CONFIGS } from '@/utils/scoring';
import scoringConfig from '@/config/scoring.config.json';
import { NavBar } from '@/components/NavBar';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildCompareData(
  left: AppraisalRecord,
  right: AppraisalRecord
): Array<{
  dimension: string;
  left: number;
  right: number;
  fullMark: number;
}> {
  const allKeys = new Set<string>();
  left.dimensions.forEach((d) => allKeys.add(d.key));
  right.dimensions.forEach((d) => allKeys.add(d.key));

  const keyToLabel: Record<string, string> = {};
  [...left.dimensions, ...right.dimensions].forEach((d) => {
    keyToLabel[d.key] = d.label;
  });

  return Array.from(allKeys).map((key) => ({
    dimension: keyToLabel[key] || key,
    left: left.scores[key] ?? 0,
    right: right.scores[key] ?? 0,
    fullMark: 10,
  }));
}

export function HistoryComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leftId = searchParams.get('left');
  const rightId = searchParams.get('right');

  const [leftRecord, setLeftRecord] = useState<AppraisalRecord | null>(null);
  const [rightRecord, setRightRecord] = useState<AppraisalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leftId || !rightId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([getRecord(leftId), getRecord(rightId)]).then(([l, r]) => {
      setLeftRecord(l || null);
      setRightRecord(r || null);
      setLoading(false);
    });
  }, [leftId, rightId]);

  const compareData = useMemo(() => {
    if (!leftRecord || !rightRecord) return [];
    return buildCompareData(leftRecord, rightRecord);
  }, [leftRecord, rightRecord]);

  const allDimensions: Dimension[] = useMemo(() => {
    if (!leftRecord && !rightRecord) return [];
    const map = new Map<string, Dimension>();
    leftRecord?.dimensions.forEach((d) => map.set(d.key, d));
    rightRecord?.dimensions.forEach((d) => {
      if (!map.has(d.key)) map.set(d.key, d);
    });
    return Array.from(map.values());
  }, [leftRecord, rightRecord]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0520] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!leftRecord || !rightRecord) {
    return (
      <div className="min-h-screen bg-[#0f0520]">
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h2 className="text-lg font-bold text-white mb-2">记录不存在</h2>
          <p className="text-sm text-gray-500 mb-5">无法找到对比的两条记录</p>
          <button
            onClick={() => navigate('/history')}
            className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const leftGrade = GRADE_CONFIGS[leftRecord.gradeLevel];
  const rightGrade = GRADE_CONFIGS[rightRecord.gradeLevel];
  const scoreDiff = rightRecord.weightedScore - leftRecord.weightedScore;

  const leftCat = scoringConfig.categories[leftRecord.category]?.name || leftRecord.category;
  const rightCat = scoringConfig.categories[rightRecord.category]?.name || rightRecord.category;

  return (
    <div className="min-h-screen w-full bg-[#0f0520] relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(255, 107, 157, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10">
        <NavBar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/history')}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              aria-label="返回列表"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <GitCompare className="w-6 h-6 text-fuchsia-400" />
                鉴定对比
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">双记录维度对比分析</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-cyan-400/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  A
                </span>
                <span className="text-xs text-gray-500">{leftCat}</span>
              </div>
              <h3 className="text-base font-bold text-white truncate mb-1" title={leftRecord.name}>
                {leftRecord.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black" style={{ color: leftGrade.color }}>
                  {leftRecord.weightedScore.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">/ 100</span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${leftGrade.color}20`, color: leftGrade.color }}
                >
                  {leftGrade.label}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">{formatDate(leftRecord.createdAt)}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-pink-400/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                  B
                </span>
                <span className="text-xs text-gray-500">{rightCat}</span>
              </div>
              <h3 className="text-base font-bold text-white truncate mb-1" title={rightRecord.name}>
                {rightRecord.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black" style={{ color: rightGrade.color }}>
                  {rightRecord.weightedScore.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">/ 100</span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${rightGrade.color}20`, color: rightGrade.color }}
                >
                  {rightGrade.label}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">{formatDate(rightRecord.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
              <span className="text-xs text-gray-400">总分差</span>
              <span
                className={
                  'text-lg font-black flex items-center gap-1 ' +
                  (scoreDiff > 0
                    ? 'text-emerald-400'
                    : scoreDiff < 0
                    ? 'text-red-400'
                    : 'text-gray-400')
                }
              >
                {scoreDiff > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : scoreDiff < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {scoreDiff > 0 ? '+' : ''}
                {scoreDiff.toFixed(1)}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-500">B - A</span>
          </div>

          <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20 mb-5">
            <h3 className="text-sm font-semibold text-pink-200 tracking-wide mb-4">
              雷达图对比
            </h3>

            <div
              className="w-full"
              style={{
                height: allDimensions.length <= 4 ? 320 : 400,
                minHeight: 320,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={compareData}
                  cx="50%"
                  cy="50%"
                  outerRadius={allDimensions.length <= 4 ? '70%' : '65%'}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{
                      fill: '#E879F9',
                      fontSize: allDimensions.length > 4 ? 11 : 12,
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
                    name="A 选手"
                    dataKey="left"
                    stroke="#22D3EE"
                    strokeWidth={2}
                    fill="#22D3EE"
                    fillOpacity={0.25}
                    animationDuration={600}
                    dot={{ r: 4, fill: '#22D3EE', stroke: '#fff', strokeWidth: 1.5 }}
                  />

                  <Radar
                    name="B 选手"
                    dataKey="right"
                    stroke="#FF6B9D"
                    strokeWidth={2}
                    fill="#FF6B9D"
                    fillOpacity={0.25}
                    animationDuration={600}
                    dot={{ r: 4, fill: '#FF6B9D', stroke: '#fff', strokeWidth: 1.5 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 10, 46, 0.95)',
                      border: '1px solid rgba(255, 107, 157, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      backdropFilter: 'blur(10px)',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} / 10`,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    iconType="circle"
                    iconSize={8}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
            <h3 className="text-sm font-semibold text-pink-200 tracking-wide mb-4">
              维度详情对比
            </h3>

            <div className="space-y-2">
              {compareData.map((item) => {
                const diff = item.right - item.left;
                const leftPct = (item.left / 10) * 100;
                const rightPct = (item.right / 10) * 100;

                return (
                  <div
                    key={item.dimension}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{item.dimension}</span>
                      <span
                        className={
                          'text-xs font-bold flex items-center gap-1 ' +
                          (diff > 0
                            ? 'text-emerald-400'
                            : diff < 0
                            ? 'text-red-400'
                            : 'text-gray-500')
                        }
                      >
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-cyan-400">A</span>
                          <span className="text-xs font-bold text-cyan-300">
                            {item.left.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                            style={{ width: `${leftPct}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-pink-400">B</span>
                          <span className="text-xs font-bold text-pink-300">
                            {item.right.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500"
                            style={{ width: `${rightPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Tag as TagIcon,
  Edit3,
  Check,
  X,
  Trash2,
  FileText,
} from 'lucide-react';
import type { AppraisalRecord } from '@/types/appraisal';
import { getRecord, deleteRecord, updateRecord } from '@/db/historyDB';
import { GRADE_CONFIGS } from '@/utils/scoring';
import scoringConfig from '@/config/scoring.config.json';
import { GradeBadgeDisplay } from '@/components/GradeBadgeDisplay';
import { DimensionRadarDisplay } from '@/components/DimensionRadarDisplay';
import { NavBar } from '@/components/NavBar';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AppraisalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecord(id)
      .then((r) => {
        setRecord(r || null);
        if (r) setNoteValue(r.note || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveNote = useCallback(async () => {
    if (!record) return;
    const updated = { ...record, note: noteValue.trim(), updatedAt: Date.now() };
    await updateRecord(updated);
    setRecord(updated);
    setEditingNote(false);
  }, [record, noteValue]);

  const handleDelete = useCallback(async () => {
    if (!record) return;
    await deleteRecord(record.id);
    navigate('/history');
  }, [record, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0520] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#0f0520]">
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h2 className="text-lg font-bold text-white mb-2">记录不存在</h2>
          <p className="text-sm text-gray-500 mb-5">该鉴定记录可能已被删除或不存在</p>
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

  const gradeConfig = GRADE_CONFIGS[record.gradeLevel];
  const categoryName = scoringConfig.categories[record.category]?.name || record.category;
  const scoresForDisplay: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(record.scores)) {
    scoresForDisplay[k] = v;
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0520] relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(255, 107, 157, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10">
        <NavBar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/history')}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              aria-label="返回列表"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white truncate" title={record.name}>
                {record.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(record.createdAt)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <TagIcon className="w-3.5 h-3.5" />
                  {categoryName}
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                  style={{
                    backgroundColor: `${gradeConfig.color}20`,
                    color: gradeConfig.color,
                  }}
                >
                  {gradeConfig.label}
                </div>
              </div>
            </div>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
              aria-label="删除记录"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
              <GradeBadgeDisplay scores={scoresForDisplay} dimensions={record.dimensions} />
            </div>

            <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
              <DimensionRadarDisplay
                scores={scoresForDisplay}
                dimensions={record.dimensions}
              />
            </div>
          </div>

          <div className="mt-5 p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-pink-200 tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" />
                维度详情
              </h3>
              <span className="text-xs text-gray-500">共 {record.dimensions.length} 项</span>
            </div>

            <div className="space-y-2">
              {record.dimensions.map((dim) => {
                const score = record.scores[dim.key] ?? 0;
                const percent = (score / 10) * 100;

                return (
                  <div
                    key={dim.key}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{dim.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-500">
                          权重 {(dim.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{dim.description}</p>
                    </div>
                    <div className="w-20 sm:w-28 h-2 rounded-full bg-white/10 overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div
                      className="text-sm font-bold w-10 text-right"
                      style={{ color: gradeConfig.color }}
                    >
                      {score.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-pink-200 tracking-wide flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                备注
              </h3>
              {!editingNote && (
                <button
                  onClick={() => setEditingNote(true)}
                  className="text-xs text-gray-400 hover:text-pink-300 transition-colors"
                >
                  编辑
                </button>
              )}
            </div>

            {editingNote ? (
              <div>
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="添加备注信息..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-pink-400/40 transition-all resize-none"
                  maxLength={200}
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setNoteValue(record.note || '');
                      setEditingNote(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    取消
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 text-xs hover:bg-pink-500/30 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed min-h-[2rem]">
                {record.note || <span className="text-gray-600 italic">暂无备注，点击编辑添加</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#1a0a2e] border border-white/10 shadow-2xl animate-pop-in">
            <h3 className="text-lg font-bold text-white mb-2">确认删除</h3>
            <p className="text-sm text-gray-400 mb-5">
              删除后无法恢复，确定要删除这条鉴定记录吗？
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

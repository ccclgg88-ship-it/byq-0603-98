import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Download,
  GitCompare,
  ChevronLeft,
  Star,
  ThumbsUp,
  Meh,
  Calendar,
  Tag as TagIcon,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useHistoryStore } from '@/store/useHistoryStore';
import { GRADE_CONFIGS } from '@/utils/scoring';
import scoringConfig from '@/config/scoring.config.json';
import type { FigureCategory, GradeLevel, SortField, SortOrder } from '@/types/appraisal';
import { NavBar } from '@/components/NavBar';

const GRADE_ICONS: Record<GradeLevel, React.ReactNode> = {
  masterpiece: <Star className="w-4 h-4" />,
  good: <ThumbsUp className="w-4 h-4" />,
  normal: <Meh className="w-4 h-4" />,
};

const CATEGORY_LABELS: Record<FigureCategory | 'all', string> = {
  all: '全部品类',
  prize: '景品',
  scale: '比例手办',
  action: '可动模型',
};

const GRADE_LABELS: Record<GradeLevel | 'all', string> = {
  all: '全部等级',
  masterpiece: '神作',
  good: '良品',
  normal: '一般',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HistoryPage() {
  const navigate = useNavigate();
  const {
    records,
    loading,
    filter,
    selectedIds,
    compareMode,
    fetchRecords,
    setFilter,
    setSort,
    toggleSelect,
    clearSelection,
    setCompareMode,
    removeRecord,
    removeSelected,
    exportToJSON,
  } = useHistoryStore();

  const [showFilters, setShowFilters] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSortToggle = useCallback(
    (field: SortField) => {
      let order: SortOrder = 'desc';
      if (filter.sortField === field && filter.sortOrder === 'desc') {
        order = 'asc';
      }
      setSort(field, order);
    },
    [filter.sortField, filter.sortOrder, setSort]
  );

  const handleExport = useCallback(() => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appraisal_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportToJSON]);

  const handleDeleteSingle = useCallback(async () => {
    if (confirmDeleteId) {
      await removeRecord(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, removeRecord]);

  const handleBatchDelete = useCallback(async () => {
    await removeSelected();
    setConfirmBatchDelete(false);
  }, [removeSelected]);

  const handleCompare = useCallback(() => {
    if (selectedIds.length === 2) {
      navigate(`/history/compare?left=${selectedIds[0]}&right=${selectedIds[1]}`);
    }
  }, [selectedIds, navigate]);

  const sortButtonClass = (field: SortField) =>
    twMerge(
      'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
      filter.sortField === field
        ? 'bg-pink-500/20 text-pink-300'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    );

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                aria-label="返回"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-pink-400" />
                  鉴定历史档案
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  共 {records.length} 条记录 · 数据存储于本地浏览器
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={twMerge(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all',
                  compareMode
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                )}
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">对比模式</span>
              </button>
              <button
                onClick={handleExport}
                disabled={records.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">导出 JSON</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={filter.keyword || ''}
                onChange={(e) => setFilter({ keyword: e.target.value })}
                placeholder="搜索手办名称或备注..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/20 transition-all text-sm"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={twMerge(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all sm:hidden',
                showFilters
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
                  : 'bg-white/5 text-gray-300 border border-white/10'
              )}
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>

            <div
              className={twMerge(
                'hidden sm:flex items-center gap-2 flex-wrap',
                showFilters ? 'flex sm:hidden' : ''
              )}
            >
              <select
                value={filter.category || 'all'}
                onChange={(e) => setFilter({ category: e.target.value as FigureCategory | 'all' })}
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-400/40 transition-all appearance-none cursor-pointer"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={filter.grade || 'all'}
                onChange={(e) => setFilter({ grade: e.target.value as GradeLevel | 'all' })}
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-400/40 transition-all appearance-none cursor-pointer"
              >
                {Object.entries(GRADE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="sm:hidden flex gap-2 mb-4 animate-fade-in">
              <select
                value={filter.category || 'all'}
                onChange={(e) => setFilter({ category: e.target.value as FigureCategory | 'all' })}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-400/40"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={filter.grade || 'all'}
                onChange={(e) => setFilter({ grade: e.target.value as GradeLevel | 'all' })}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-400/40"
              >
                {Object.entries(GRADE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
            <span className="text-xs text-gray-500 shrink-0">排序：</span>
            <button
              onClick={() => handleSortToggle('createdAt')}
              className={sortButtonClass('createdAt')}
            >
              <Calendar className="w-3.5 h-3.5" />
              时间
              {filter.sortField === 'createdAt' && (
                <ArrowUpDown className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={() => handleSortToggle('weightedScore')}
              className={sortButtonClass('weightedScore')}
            >
              <Star className="w-3.5 h-3.5" />
              分数
              {filter.sortField === 'weightedScore' && (
                <ArrowUpDown className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={() => handleSortToggle('name')}
              className={sortButtonClass('name')}
            >
              <TagIcon className="w-3.5 h-3.5" />
              名称
              {filter.sortField === 'name' && (
                <ArrowUpDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {compareMode && (
            <div className="mb-4 p-3 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/30 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-fuchsia-300">
                <GitCompare className="w-4 h-4" />
                <span>已选择 {selectedIds.length} / 2 条记录进行对比</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.length === 2 && (
                  <button
                    onClick={handleCompare}
                    className="px-3 py-1.5 rounded-lg bg-fuchsia-500/30 text-fuchsia-200 text-xs font-medium hover:bg-fuchsia-500/40 transition-colors"
                  >
                    开始对比
                  </button>
                )}
                <button
                  onClick={() => {
                    clearSelection();
                    setCompareMode(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {selectedIds.length > 0 && !compareMode && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-amber-300">
                <CheckSquare className="w-4 h-4" />
                <span>已选择 {selectedIds.length} 条记录</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmBatchDelete(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-300 mb-1">暂无鉴定记录</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                完成第一次手办品相鉴定后，记录将自动保存到这里
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:from-pink-400 hover:to-purple-400 transition-all"
              >
                去鉴定
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((record) => {
                const gradeConfig = GRADE_CONFIGS[record.gradeLevel];
                const isSelected = selectedIds.includes(record.id);
                const categoryName =
                  scoringConfig.categories[record.category]?.name || record.category;

                return (
                  <div
                    key={record.id}
                    className={twMerge(
                      'group relative p-5 rounded-2xl bg-white/[0.03] backdrop-blur-sm border transition-all duration-300 cursor-pointer overflow-hidden',
                      isSelected
                        ? 'border-fuchsia-400/50 bg-fuchsia-500/5 shadow-lg shadow-fuchsia-500/10'
                        : 'border-white/[0.08] hover:border-pink-400/30 hover:bg-white/[0.05]'
                    )}
                    onClick={() => {
                      if (compareMode || selectedIds.length > 0) {
                        toggleSelect(record.id);
                      } else {
                        navigate(`/history/${record.id}`);
                      }
                    }}
                  >
                    {(compareMode || isSelected) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(record.id);
                        }}
                        className="absolute top-3 right-3 z-10"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-fuchsia-400" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                        )}
                      </button>
                    )}

                    {!compareMode && !isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(record.id);
                        }}
                        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Square className="w-5 h-5 text-gray-500 hover:text-fuchsia-400 transition-colors" />
                      </button>
                    )}

                    <div className="flex items-start justify-between mb-3 pr-6">
                      <h3
                        className="text-sm font-bold text-white truncate flex-1"
                        title={record.name}
                      >
                        {record.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: `${gradeConfig.color}20`,
                          color: gradeConfig.color,
                        }}
                      >
                        {GRADE_ICONS[record.gradeLevel]}
                        {gradeConfig.label}
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-gray-400">
                        {categoryName}
                      </span>
                    </div>

                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <div className="text-[10px] text-gray-500 mb-0.5">加权总分</div>
                        <div
                          className="text-2xl font-black"
                          style={{ color: gradeConfig.color }}
                        >
                          {record.weightedScore.toFixed(1)}
                          <span className="text-xs text-gray-500 font-normal ml-0.5">/ 100</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 mb-0.5">维度数</div>
                        <div className="text-sm font-bold text-gray-300">
                          {record.dimensions.length} 项
                        </div>
                      </div>
                    </div>

                    {record.note && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{record.note}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.createdAt)}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!compareMode && selectedIds.length === 0 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(record.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                              aria-label="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#1a0a2e] border border-white/10 shadow-2xl animate-pop-in">
            <h3 className="text-lg font-bold text-white mb-2">确认删除</h3>
            <p className="text-sm text-gray-400 mb-5">
              删除后无法恢复，确定要删除这条鉴定记录吗？
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteSingle}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmBatchDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#1a0a2e] border border-white/10 shadow-2xl animate-pop-in">
            <h3 className="text-lg font-bold text-white mb-2">批量删除</h3>
            <p className="text-sm text-gray-400 mb-5">
              确定要删除选中的 {selectedIds.length} 条记录吗？此操作不可恢复。
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmBatchDelete(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                全部删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

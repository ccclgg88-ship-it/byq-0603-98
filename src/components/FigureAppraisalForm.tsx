import { useMemo, useCallback } from 'react';
import { Sparkles, Send, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppraisalStore } from '@/store/useAppraisalStore';
import { getDimensionsByCategory } from '@/utils/scoring';
import { useDraftStorage, clearDraft as clearLocalDraft } from '@/hooks/useDraftStorage';
import { CategorySelector } from './CategorySelector';
import { DimensionSlider } from './DimensionSlider';
import { DraftStatusBar } from './DraftStatusBar';

export function FigureAppraisalForm() {
  const {
    category,
    scores,
    errors,
    draftSavedAt,
    submitted,
    setCategory,
    setScore,
    validateField,
    validateAll,
    restoreState,
    setSubmitted,
    reset,
  } = useAppraisalStore();

  const dimensions = useMemo(() => getDimensionsByCategory(category), [category]);
  const errorCount = Object.values(errors).filter((e) => e && e.trim()).length;

  const handleRestore = useCallback(
    (state: Parameters<typeof restoreState>[0]) => {
      restoreState(state);
    },
    [restoreState]
  );

  const { clear: clearStorage } = useDraftStorage(
    { category, scores, errors, draftSavedAt },
    handleRestore
  );

  const handleClearDraft = useCallback(() => {
    clearStorage();
    clearLocalDraft();
    reset();
  }, [clearStorage, reset]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const isValid = validateAll();
      if (isValid) {
        setSubmitted(true);
        window.setTimeout(() => setSubmitted(false), 3000);
      }
    },
    [validateAll, setSubmitted]
  );

  const handleReset = useCallback(() => {
    clearLocalDraft();
    reset();
  }, [reset]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
      {submitted && (
        <div
          className={twMerge(
            'flex items-center gap-2.5 px-4 py-3 rounded-2xl border animate-fade-in',
            'bg-emerald-500/15 border-emerald-400/30'
          )}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium text-emerald-300">
            鉴定提交成功！评分结果已生成
          </span>
        </div>
      )}

      {!submitted && errorCount > 0 && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border animate-fade-in bg-amber-500/10 border-amber-400/30"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium text-amber-300">
            存在 {errorCount} 项待修正，请检查红色提示的字段
          </span>
        </div>
      )}

      <DraftStatusBar savedAt={draftSavedAt} onClear={handleClearDraft} />

      <CategorySelector value={category} onChange={setCategory} />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-pink-200 tracking-wide">
            品相评分（{dimensions.length} 项）
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dimensions.map((dim, idx) => (
            <DimensionSlider
              key={dim.key}
              dimension={dim}
              value={scores[dim.key] ?? null}
              error={errors[dim.key]}
              onChange={(v) => setScore(dim.key, v)}
              onBlur={() => validateField(dim.key)}
              tabIndex={idx + 1}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          tabIndex={dimensions.length + 2}
          className={twMerge(
            'flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold text-white',
            'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500',
            'hover:from-pink-400 hover:via-fuchsia-400 hover:to-purple-400',
            'shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50',
            'transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e]'
          )}
        >
          <Send className="w-4 h-4" />
          提交鉴定
        </button>

        <button
          type="button"
          onClick={handleReset}
          tabIndex={dimensions.length + 3}
          className={twMerge(
            'flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-medium text-gray-300',
            'bg-white/5 border border-white/10',
            'hover:bg-white/10 hover:text-white hover:border-white/20',
            'transition-all duration-300 active:scale-[0.98]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e]'
          )}
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>
    </form>
  );
}

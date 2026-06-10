import { Save, Trash2, Clock } from 'lucide-react';
import { formatDraftTime } from '@/hooks/useDraftStorage';

interface DraftStatusBarProps {
  savedAt: number | null;
  onClear: () => void;
}

export function DraftStatusBar({ savedAt, onClear }: DraftStatusBarProps) {
  if (!savedAt) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-400/20 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Save className="w-4 h-4 text-emerald-400" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3 h-3 text-emerald-300/70" />
          <span className="text-emerald-300">
            草稿已保存 · {formatDraftTime(savedAt)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        aria-label="清除草稿"
      >
        <Trash2 className="w-3 h-3" />
        <span className="hidden sm:inline">清除</span>
      </button>
    </div>
  );
}

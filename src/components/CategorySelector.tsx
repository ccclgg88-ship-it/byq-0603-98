import { Gift, Box, Move } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { FigureCategory } from '@/types/appraisal';
import scoringConfig from '@/config/scoring.config.json';

interface CategorySelectorProps {
  value: FigureCategory;
  onChange: (category: FigureCategory) => void;
}

const CATEGORY_ICONS: Record<FigureCategory, React.ReactNode> = {
  prize: <Gift className="w-4 h-4" />,
  scale: <Box className="w-4 h-4" />,
  action: <Move className="w-4 h-4" />,
};

const CATEGORIES: FigureCategory[] = ['prize', 'scale', 'action'];

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-pink-200 mb-3 tracking-wide">
        选择手办品类
      </label>
      <div
        role="tablist"
        aria-label="手办品类选择"
        className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
      >
        {CATEGORIES.map((cat) => {
          const config = scoringConfig.categories[cat];
          const isActive = value === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onChange(cat)}
              className={twMerge(
                'relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl',
                'text-sm font-medium transition-all duration-300 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e]',
                isActive
                  ? 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-500 text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
                  : 'text-gray-400 hover:text-pink-300 hover:bg-white/5'
              )}
            >
              <span
                className={twMerge(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
                  isActive ? 'bg-white/20' : 'bg-white/5'
                )}
              >
                {CATEGORY_ICONS[cat]}
              </span>
              <span className="text-xs sm:text-sm">{config.name}</span>
              <span className="hidden sm:block text-[10px] opacity-70 leading-tight text-center">
                {config.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

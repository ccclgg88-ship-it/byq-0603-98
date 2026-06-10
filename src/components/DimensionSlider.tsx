import { useState } from 'react';
import { AlertCircle, Asterisk } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { Dimension } from '@/types/appraisal';
import { MIN_SCORE, MAX_SCORE, parseScoreInput } from '@/utils/validation';

interface DimensionSliderProps {
  dimension: Dimension;
  value: number | null;
  error?: string;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  tabIndex?: number;
}

export function DimensionSlider({
  dimension,
  value,
  error,
  onChange,
  onBlur,
  tabIndex,
}: DimensionSliderProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() ?? '');

  const hasError = Boolean(error);
  const percent = value !== null ? ((value - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    onChange(num);
    setInputValue(num.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const num = parseScoreInput(val);
    onChange(num);
  };

  const handleInputBlur = () => {
    const num = parseScoreInput(inputValue);
    if (num !== null) {
      const clamped = Math.max(MIN_SCORE, Math.min(MAX_SCORE, num));
      setInputValue(clamped.toString());
      onChange(clamped);
    }
    onBlur();
  };

  return (
    <div
      className={twMerge(
        'group relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300',
        hasError
          ? 'bg-red-500/10 border-red-400/40 animate-shake'
          : 'bg-white/5 border-white/10 hover:border-pink-400/30 hover:bg-white/[0.07]'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-white">{dimension.label}</h4>
            {dimension.required && (
              <Asterisk className="w-3 h-3 text-pink-400 shrink-0" aria-label="必填" />
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 ml-1">
              权重 {(dimension.weight * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{dimension.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <input
            type="range"
            min={MIN_SCORE}
            max={MAX_SCORE}
            step={0.5}
            value={value ?? MIN_SCORE}
            onChange={handleSliderChange}
            onBlur={onBlur}
            tabIndex={tabIndex}
            aria-label={`${dimension.label}评分`}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />
          <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
            <span>{MIN_SCORE}</span>
            <span>5</span>
            <span>{MAX_SCORE}</span>
          </div>
        </div>

        <div className="relative">
          <input
            type="number"
            min={MIN_SCORE}
            max={MAX_SCORE}
            step={0.5}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="--"
            tabIndex={tabIndex}
            aria-label={`${dimension.label}分数输入`}
            className={twMerge(
              'w-16 h-10 text-center text-lg font-bold rounded-xl border transition-all duration-200',
              'bg-white/5 focus:bg-white/10 focus:outline-none',
              hasError
                ? 'border-red-400/50 text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/30'
                : 'border-white/10 text-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30'
            )}
          />
        </div>
      </div>

      {hasError && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

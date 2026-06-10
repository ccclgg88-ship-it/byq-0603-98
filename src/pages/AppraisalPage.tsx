import { Star, ScanLine } from 'lucide-react';
import { FigureAppraisalForm } from '@/components/FigureAppraisalForm';
import { DimensionRadar } from '@/components/DimensionRadar';
import { GradeBadge } from '@/components/GradeBadge';

export function AppraisalPage() {
  return (
    <div className="min-h-screen w-full bg-[#0f0520] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(255, 107, 157, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.05) 0%, transparent 70%)
          `,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <header className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="relative">
              <ScanLine className="w-7 h-7 sm:w-8 sm:h-8 text-pink-400" />
              <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-yellow-400 animate-twinkle" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              手办品相鉴定系统
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto leading-relaxed">
            多维度评分 · 加权算法 · 客观定级
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <section className="lg:col-span-3 space-y-5">
            <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
              <FigureAppraisalForm />
            </div>
          </section>

          <aside className="lg:col-span-2 space-y-5">
            <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
              <GradeBadge />
            </div>

            <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/20">
              <DimensionRadar />
            </div>
          </aside>
        </main>

        <footer className="mt-10 sm:mt-14 text-center text-xs text-gray-600">
          <p>评分结果仅供参考 · 数据存储于本地浏览器，7天后自动过期清除</p>
        </footer>
      </div>
    </div>
  );
}

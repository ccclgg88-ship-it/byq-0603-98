import { Link, useLocation } from 'react-router-dom';
import { ScanLine, History, Star } from 'lucide-react';

export function NavBar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isHistory = location.pathname.startsWith('/history');

  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl bg-[#0f0520]/80 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <ScanLine className="w-6 h-6 text-pink-400 transition-transform group-hover:rotate-12" />
            <Star className="absolute -top-1 -right-1 w-2.5 h-2.5 text-yellow-400 fill-yellow-400 animate-twinkle" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            手办品相鉴定
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              isHome
                ? 'bg-pink-500/20 text-pink-300'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span className="hidden sm:inline">快速鉴定</span>
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              isHistory
                ? 'bg-pink-500/20 text-pink-300'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">历史档案</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

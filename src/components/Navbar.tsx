import { User } from '../types.ts';
import { LogOut, ShieldCheck, UserCheck, Activity, Award, BookOpen, Compass, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: 'home' | 'assessment' | 'history' | 'admin';
  setActiveTab: (tab: 'home' | 'assessment' | 'history' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-green-100 dark:border-green-950/40 py-4 px-6 md:px-12 flex flex-wrap items-center justify-between gap-4 shadow-xs shrink-0">
      {/* Brand Logo */}
      <div
        onClick={() => setActiveTab('home')}
        className="cursor-pointer flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200/50 dark:shadow-none font-display font-bold text-xl">
          A
        </div>
        <div>
          <span className="font-display font-extrabold text-base md:text-lg tracking-tight text-green-900 dark:text-green-100 flex items-center gap-1.5 leading-none">
            AyurCheck <span className="text-[9px] font-mono bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Expert</span>
          </span>
          <p className="text-[9px] font-sans text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mt-0.5">Ayurveda Dosha Identification System</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`cursor-pointer px-3.5 py-2 rounded-lg text-xs font-bold font-display transition-all ${
            activeTab === 'home'
              ? 'bg-white dark:bg-gray-950 text-ayur-green-600 dark:text-ayur-green-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Explore</span>
        </button>

        {user && (
          <>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`cursor-pointer px-3.5 py-2 rounded-lg text-xs font-bold font-display transition-all ${
                activeTab === 'assessment'
                  ? 'bg-white dark:bg-gray-950 text-ayur-green-600 dark:text-ayur-green-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" /> Diagnose</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`cursor-pointer px-3.5 py-2 rounded-lg text-xs font-bold font-display transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-950 text-ayur-green-600 dark:text-ayur-green-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> My Reports</span>
            </button>
          </>
        )}

        {user && user.isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`cursor-pointer px-3.5 py-2 rounded-lg text-xs font-bold font-display transition-all ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-gray-950 text-red-500 shadow-xs'
                : 'text-red-400/80 hover:text-red-500'
            }`}
          >
            <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Admin</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* User state or login */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-bold font-display text-gray-900 dark:text-white flex items-center gap-1 justify-end">
                {user.isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-ayur-green-500" />
                )}{' '}
                {user.name}
              </span>
              <span className="block text-[10px] font-semibold font-mono text-gray-400">
                {user.isAdmin ? 'System Admin' : `Age ${user.age} • ${user.gender}`}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="cursor-pointer p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-transparent hover:border-red-500/10"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="cursor-pointer px-4.5 py-2 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 text-white text-xs font-bold font-display shadow-sm hover:shadow-md transition-all"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </nav>
  );
}

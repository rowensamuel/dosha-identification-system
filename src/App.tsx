import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import HomePanel from './components/HomePanel.tsx';
import AuthModal from './components/AuthModal.tsx';
import QuestionnairePanel from './components/QuestionnairePanel.tsx';
import ResultsPanel from './components/ResultsPanel.tsx';
import HistoryPanel from './components/HistoryPanel.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { User, Assessment } from './types.ts';
import { Activity, ShieldCheck, Heart, Sparkles, User as UserIcon, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'assessment' | 'history' | 'admin'>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ayur_token');
    const savedUser = localStorage.getItem('ayur_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Force light mode always & clear any previous state
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('ayur_dark');
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ayur_token', newToken);
    localStorage.setItem('ayur_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setActiveTab('home');
    setActiveAssessment(null);
    localStorage.removeItem('ayur_token');
    localStorage.removeItem('ayur_user');
  };

  const startAssessment = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setActiveAssessment(null);
      setActiveTab('assessment');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F5] text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If moving tabs, clear single result focus
          if (tab !== 'assessment') {
            setActiveAssessment(null);
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-10">
        
        {/* Explore/Home Tab */}
        {activeTab === 'home' && (
          <HomePanel
            onStartAssessment={startAssessment}
            isAuthenticated={!!user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* Assessment/Diagnosis Tab */}
        {activeTab === 'assessment' && user && token && (
          activeAssessment ? (
            <ResultsPanel
              token={token}
              assessment={activeAssessment}
              onRetake={() => setActiveAssessment(null)}
            />
          ) : (
            <QuestionnairePanel
              token={token}
              onComplete={(ass) => setActiveAssessment(ass)}
              onCancel={() => setActiveTab('home')}
            />
          )
        )}

        {/* Previous Reports Tab */}
        {activeTab === 'history' && user && token && (
          activeAssessment ? (
            <ResultsPanel
              token={token}
              assessment={activeAssessment}
              onRetake={() => setActiveAssessment(null)}
            />
          ) : (
            <HistoryPanel
              token={token}
              onSelectAssessment={(ass) => setActiveAssessment(ass)}
            />
          )
        )}

        {/* Administrator Tab */}
        {activeTab === 'admin' && user?.isAdmin && token && (
          <AdminPanel token={token} />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="no-print mt-auto border-t border-gray-200/50 dark:border-gray-800/50 py-6 text-center text-xs text-gray-500 bg-white/30 dark:bg-gray-950/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 AyurCheck Ayurveda Expert System. Fusing Computational Logic with Traditional Wisdom.</p>
          <div className="flex gap-4 text-[10px] font-semibold text-gray-400">
            <span>Sushruta Samhita Base</span>
            <span>•</span>
            <span>Algorithmic Rule Engine v2.1</span>
            <span>•</span>
            <span>Secure Server-Side AI</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal Popup */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

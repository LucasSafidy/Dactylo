import React from 'react';
import { useUser } from '../../store/userContext';
import { Keyboard, Layout, Settings, LogOut, Zap, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ShellProps {
  activeTab: 'typing' | 'dashboard' | 'settings';
  onTabChange: (tab: 'typing' | 'dashboard' | 'settings') => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ activeTab, onTabChange, children }) => {
  const { currentUser, logout } = useUser();

  if (!currentUser) return <>{children}</>;

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col font-sans">
      {/* Header */}
      <header className="h-[70px] border-b border-cyber-border flex items-center justify-between px-10 bg-cyber-bg sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <div className="logo text-2xl font-extrabold text-cyber-primary tracking-tighter flex items-center gap-2">
            TYPE_PRO <span className="font-light opacity-50 text-sm">| v1.2</span>
          </div>
          
          <nav className="hidden md:flex gap-6 text-[13px] font-semibold uppercase tracking-widest text-cyber-text-muted">
            <NavTab 
              active={activeTab === 'typing'} 
              onClick={() => onTabChange('typing')} 
              label="Standard" 
            />
            <NavTab 
              active={activeTab === 'dashboard'} 
              onClick={() => onTabChange('dashboard')} 
              label="Dashboard" 
            />
            <NavTab 
              active={activeTab === 'settings'} 
              onClick={() => onTabChange('settings')} 
              label="Settings" 
            />
          </nav>
        </div>

        <div className="flex items-center gap-5">
           <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-primary rounded-full shadow-[0_0_8px_rgba(0,255,65,0.5)]"></div>
              <span className="text-[11px] text-cyber-text-muted">IndexedDB Local</span>
           </div>

           <div className="xp-pill shrink-0">
             LVL {currentUser.level} • {currentUser.xp.toLocaleString()} XP
           </div>

           <div className="flex items-center gap-4 border-l border-cyber-border pl-5">
              <button 
                onClick={logout}
                className="p-2 text-cyber-text-muted hover:text-cyber-error transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <div className="w-8 h-8 rounded-full bg-cyber-border border-2 border-cyber-primary p-0.5">
                <div className="w-full h-full bg-cyber-text-muted rounded-full flex items-center justify-center font-bold text-[10px] text-white">
                  {currentUser.username[0].toUpperCase()}
                </div>
              </div>
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[1440px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavTab = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "pb-1 transition-all border-b-2",
      active 
        ? "text-cyber-text border-cyber-primary" 
        : "text-cyber-text-muted border-transparent hover:text-cyber-text"
    )}
  >
    {label}
  </button>
);

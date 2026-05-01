import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useUser } from '../store/userContext';
import { db, Session } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp, Award, Calendar, Zap, Layout, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const Dashboard: React.FC = () => {
  const { currentUser } = useUser();
  const sessions = useLiveQuery(() => db.sessions.where('userId').equals(currentUser?.id || 0).toArray());

  const chartData = useMemo(() => {
    if (!sessions) return null;
    const sorted = [...sessions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return {
      labels: sorted.map(s => format(s.timestamp, 'dd/MM HH:mm')),
      datasets: [
        {
          label: 'WPM Evolution',
          data: sorted.map(s => s.wpm),
          borderColor: '#00FF41',
          backgroundColor: 'rgba(0, 255, 65, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#00FF41',
        }
      ],
    };
  }, [sessions]);

  const stats = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    const totalWpm = sessions.reduce((acc, s) => acc + s.wpm, 0);
    const maxWpm = Math.max(...sessions.map(s => s.wpm));
    const avgAccuracy = sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length;
    
    return {
      avgWpm: Math.round(totalWpm / sessions.length),
      maxWpm,
      avgAccuracy: Math.round(avgAccuracy),
      totalSessions: sessions.length
    };
  }, [sessions]);

  if (!currentUser) return <div className="p-10 text-cyber-text-muted italic">Veuillez vous connecter.</div>;

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-12">
      {/* Profile Summary */}
      <div className="flex flex-col md:flex-row gap-10 mb-16 items-center">
        <div className="w-32 h-32 rounded-full bg-cyber-border border-2 border-cyber-primary p-2 flex items-center justify-center shrink-0">
          <div className="w-full h-full rounded-full bg-cyber-text-muted flex flex-col items-center justify-center text-white">
             <span className="text-3xl font-black">{currentUser.level}</span>
             <span className="text-[9px] font-bold uppercase tracking-widest leading-none">LEVEL</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h1 className="text-4xl font-black tracking-tight">{currentUser.username}</h1>
            <div className="local-db-badge flex items-center gap-2 bg-cyber-surface px-3 py-1 rounded-full border border-cyber-border">
              <div className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
              <span className="text-[10px] text-cyber-text-muted font-bold uppercase tracking-wider">Local IndexedDB</span>
            </div>
          </div>
          <p className="text-cyber-text-muted mb-6 max-w-lg font-medium">{currentUser.bio || "Optimizing keystrokes for peak performance."}</p>
          
          <div className="w-full max-w-md h-1.5 bg-cyber-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyber-primary transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,65,0.4)]"
              style={{ width: `${(currentUser.xp % 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-cyber-text-muted tracking-widest uppercase max-w-md">
            <span>{currentUser.xp} XP</span>
            <span>LVL {currentUser.level + 1}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard label="84" sub="Avg WPM" color="primary" />
        <StatCard label={`${stats?.maxWpm || 0}`} sub="Peak Speed" color="text" />
        <StatCard label={`${stats?.avgAccuracy || 0}%`} sub="Avg Precision" color="text" />
        <StatCard label={`${stats?.totalSessions || 0}`} sub="Total Sessions" color="text" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Chart Section */}
           <div className="card">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-cyber-text-muted flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyber-primary" /> Performance Timeline
                </h2>
              </div>
              
              <div className="h-[300px]">
                {chartData ? (
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#475569', font: { size: 10 } } },
                        x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 10 } } }
                      }
                    }} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-cyber-text/20 italic">Insufficient data for visualization.</div>
                )}
              </div>
           </div>

           {/* History */}
           <div className="card">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-cyber-text-muted mb-8 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyber-primary" /> Terminal History
              </h2>
              <div className="space-y-3">
                {sessions?.slice().reverse().slice(0, 5).map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-cyber-bg/40 rounded-lg border border-cyber-border hover:border-cyber-primary/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <Zap className="w-4 h-4 text-cyber-primary" />
                      <div>
                        <div className="font-mono text-lg">{session.wpm} <span className="text-xs text-cyber-text-muted uppercase">WPM</span></div>
                        <div className="text-[10px] text-cyber-text-muted uppercase tracking-wider font-bold">
                          {format(session.timestamp, 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-cyber-primary">{session.accuracy}%</div>
                      <div className="text-[10px] text-cyber-text-muted font-bold uppercase tracking-widest">{session.mode}</div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="space-y-10">
           <div className="card">
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-cyber-text-muted mb-8 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyber-primary" /> Achievements
              </div>
              <div className="grid grid-cols-2 gap-4">
                <BadgeItem unlocked title="Speedster" icon="⚡" />
                <BadgeItem unlocked title="Precision" icon="🎯" />
                <BadgeItem unlocked={false} title="Marathon" icon="🏃" />
                <BadgeItem unlocked={false} title="Zen" icon="🧘" />
              </div>
           </div>

           <div className="card">
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-cyber-text-muted mb-6 font-bold">Daily Tasks</div>
              <div className="flex flex-col gap-4">
                <ChallengeItem icon="⚡" title="Speedster Streak" progress={75} />
                <ChallengeItem icon="🎯" title="100% Accuracy" progress={40} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, sub, color }: { label: string | number, sub: string, color: string }) => (
  <div className="bg-cyber-surface border border-cyber-border p-8 rounded-xl flex flex-col group hover:border-cyber-primary/30 transition-all">
    <span className={cn(
      "text-[42px] font-light leading-none mb-1",
      color === 'primary' ? 'text-cyber-primary' : 'text-cyber-text'
    )}>{label}</span>
    <span className="text-[11px] text-cyber-text-muted uppercase tracking-widest font-bold">{sub}</span>
  </div>
);

const BadgeItem = ({ unlocked, title, icon }: { unlocked: boolean, title: string, icon: string }) => (
  <div className={cn(
    "flex flex-col items-center p-5 rounded-lg border transition-all",
    unlocked ? "bg-cyber-bg border-cyber-primary/20" : "bg-cyber-bg/50 border-transparent opacity-30 brightness-50"
  )}>
    <span className="text-2xl mb-2">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-tighter text-center text-cyber-text-muted">{title}</span>
  </div>
);

const ChallengeItem = ({ icon, title, progress }: { icon: string, title: string, progress: number }) => (
  <div className="flex items-center gap-4">
    <div className="w-8 h-8 rounded-md bg-cyber-bg border border-cyber-border flex items-center justify-center text-sm">{icon}</div>
    <div className="flex-1">
      <div className="text-[12px] font-bold text-cyber-text">{title}</div>
      <div className="w-full h-1 bg-cyber-bg rounded-full mt-1.5 overflow-hidden">
        <div className="h-full bg-cyber-primary rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  </div>
);

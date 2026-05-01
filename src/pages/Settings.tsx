import React from 'react';
import { useUser } from '../store/userContext';
import { Type, Globe, Volume2, Moon, Focus, Layout, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useUser();

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-12 flex items-center gap-4">
        <Layout className="w-10 h-10 text-cyber-primary" /> Configuration
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Layout & Language */}
        <SettingsSection title="Clavier & Langue" icon={<Globe className="w-5 h-5 text-cyber-primary" />}>
          <div className="space-y-6">
            <ToggleOption 
              label="Disposition" 
              options={['AZERTY', 'QWERTY']} 
              value={settings.layout} 
              onChange={(v) => updateSettings({ layout: v })} 
            />
            <ToggleOption 
              label="Langue du texte" 
              options={['FR', 'EN']} 
              value={settings.language} 
              onChange={(v) => updateSettings({ language: v })} 
            />
          </div>
        </SettingsSection>

        {/* Visuals */}
        <SettingsSection title="Apparence" icon={<Type className="w-5 h-5 text-cyber-secondary" />}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-cyber-text/40">Taille de police</label>
              <input 
                type="range" 
                min="12" 
                max="32" 
                value={settings.fontSize} 
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-cyber-primary"
              />
              <div className="text-right font-mono text-xs">{settings.fontSize}px</div>
            </div>
            <ToggleOption 
              label="Police" 
              options={['Inter', 'JetBrains Mono', 'Roboto Mono']} 
              value={settings.fontFamily} 
              onChange={(v) => updateSettings({ fontFamily: v })} 
            />
          </div>
        </SettingsSection>

        {/* Feedback & Focus */}
        <SettingsSection title="Feedback & Immersion" icon={<Volume2 className="w-5 h-5 text-cyber-accent" />}>
          <div className="space-y-4">
            <SwitchOption 
              label="Sons de frappe" 
              active={settings.soundEnabled} 
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })} 
            />
            <SwitchOption 
              label="Mode Focus (Zen)" 
              active={settings.focusMode} 
              onClick={() => updateSettings({ focusMode: !settings.focusMode })} 
            />
          </div>
        </SettingsSection>

        {/* Profile Info */}
        <SettingsSection title="Compte & Export" icon={<Save className="w-5 h-5 text-cyber-text/60" />}>
           <div className="space-y-4">
              <button className="w-full py-3 bg-cyber-surface border border-cyber-text/10 rounded-xl font-bold hover:bg-cyber-text/5 transition-colors text-sm">
                Exporter les données (JSON)
              </button>
              <button className="w-full py-3 border border-cyber-error/30 text-cyber-error rounded-xl font-bold hover:bg-cyber-error/5 transition-colors text-sm">
                Supprimer mon historique
              </button>
           </div>
        </SettingsSection>
      </div>
    </div>
  );
};

const SettingsSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-cyber-surface/50 border border-cyber-text/5 p-8 rounded-3xl">
    <div className="flex items-center gap-3 mb-8 border-b border-cyber-text/5 pb-4">
      {icon}
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const ToggleOption = ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-cyber-text/40">{label}</label>
    <div className="flex gap-2 bg-cyber-bg p-1 rounded-xl">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            value === opt ? "bg-cyber-primary text-cyber-bg shadow-lg shadow-cyber-primary/20" : "text-cyber-text/40 hover:text-cyber-text"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const SwitchOption = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <div className="flex items-center justify-between p-4 bg-cyber-bg/50 rounded-2xl border border-cyber-text/5">
    <span className="text-sm font-bold">{label}</span>
    <button 
      onClick={onClick}
      className={cn(
        "w-12 h-6 rounded-full relative transition-colors duration-300",
        active ? "bg-cyber-primary" : "bg-cyber-text/20"
      )}
    >
      <div className={cn(
        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
        active ? "left-7" : "left-1"
      )} />
    </button>
  </div>
);

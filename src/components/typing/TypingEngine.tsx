import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTyping } from '../../hooks/useTyping';
import { cn } from '../../lib/utils';
import { useUser } from '../../store/userContext';
import { Keyboard, RotateCcw, Zap, Target, Clock, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

import { soundService } from '../../services/soundService';

export const TypingEngine: React.FC = () => {
  const { settings, saveSession } = useUser();
  const { targetText, userInput, status, stats, handleInput, reset } = useTyping(
    settings?.language as 'FR' | 'EN',
    'standard'
  );
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [showStats, setShowStats] = useState(false);
  const lastInputLength = useRef(0);

  useEffect(() => {
    if (userInput.length > lastInputLength.current) {
      const isCorrect = userInput[userInput.length - 1] === targetText[userInput.length - 1];
      if (settings?.soundEnabled) {
        if (isCorrect) soundService.playKeySound();
        else soundService.playErrorSound();
      }
    }
    lastInputLength.current = userInput.length;
  }, [userInput, targetText, settings?.soundEnabled]);

  useEffect(() => {
    if (status === 'FINISHED') {
      setShowStats(true);
      if (settings?.soundEnabled) soundService.playSuccessSound();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ffcc', '#ff00ff', '#ffffff']
      });

      // Save to DB
      saveSession({
        wpm: stats.wpm,
        cpm: stats.cpm,
        accuracy: stats.accuracy,
        duration: stats.timeElapsed,
        mode: 'standard',
        errors: {
          total: stats.errors,
          byCharacter: stats.charErrors,
          byFinger: {} // Future improvement
        }
      });
    }
  }, [status, stats, saveSession]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleRestart = () => {
    setShowStats(false);
    reset();
    setTimeout(focusInput, 10);
  };

  const renderLetters = () => {
    return targetText.split('').map((char, index) => {
      let className = "letter-pending transition-colors duration-200";
      if (index < userInput.length) {
        className = userInput[index] === char ? "letter-correct" : "letter-incorrect";
      }

      return (
        <span key={index} className={cn("inline-block relative font-mono text-2xl md:text-3xl", className)}>
          {index === userInput.length && (
            <motion.div 
              layoutId="cursor"
              className="absolute -left-0.5 top-0 w-0.5 h-full bg-cyber-primary"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 w-full max-w-[1280px] mx-auto px-10 py-12">
      <AnimatePresence mode="wait">
        {!showStats ? (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col justify-center min-h-[500px] relative"
          >
            {/* Metrics Bar */}
            <div className="flex gap-10 mb-10">
              <div className="flex flex-col">
                <span className="metric-value">{stats.wpm}</span>
                <span className="metric-label">WPM</span>
              </div>
              <div className="flex flex-col">
                <span className="metric-value">
                  {stats.accuracy}<span className="text-[20px] font-light">%</span>
                </span>
                <span className="metric-label">Accuracy</span>
              </div>
              <div className="flex flex-col">
                <span className="metric-value">
                  {Math.floor(stats.timeElapsed / 60).toString().padStart(2, '0')}:
                  {(stats.timeElapsed % 60).toString().padStart(2, '0')}
                </span>
                <span className="metric-label">Time</span>
              </div>
            </div>

            {/* Typing Area */}
            <div 
              className="relative cursor-text group"
              onClick={focusInput}
            >
              <div className="flex flex-wrap gap-x-0 font-mono text-[32px] leading-[1.6] select-none text-cyber-text-muted transition-all duration-300">
                {targetText.split('').map((char, index) => {
                  let className = "relative inline-block";
                  if (index < userInput.length) {
                    className += userInput[index] === char ? " text-cyber-text" : " text-cyber-error bg-cyber-error/10 rounded-sm";
                  }

                  return (
                    <span key={index} className={className}>
                      {index === userInput.length && (
                        <div className="absolute -left-[1px] top-[15%] w-[3px] h-[70%] bg-cyber-primary animate-pulse" />
                      )}
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </div>
              
              <input
                ref={inputRef}
                type="text"
                autoFocus
                className="absolute inset-0 opacity-0 cursor-default"
                value={userInput}
                onChange={(e) => handleInput(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />

              {status === 'READY' && (
                <div className="absolute -inset-4 bg-cyber-bg/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                   <span className="text-cyber-primary/50 font-bold uppercase tracking-widest text-xs">Press any key to start typing</span>
                </div>
              )}

              {/* Combo Badge (Simulated) */}
              <AnimatePresence>
                {userInput.length > 0 && stats.accuracy > 90 && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0, rotate: 2 }}
                    animate={{ y: 0, opacity: 1, rotate: 2 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute -bottom-20 right-0 bg-gradient-to-br from-cyber-primary to-cyber-secondary text-black px-5 py-2.5 rounded-lg font-black text-xl shadow-[0_10px_30px_rgba(0,255,65,0.2)]"
                  >
                    COMBO X{Math.min(10, Math.floor(userInput.length / 10))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-auto pt-10 border-t border-cyber-border flex justify-between text-[11px] text-cyber-text-muted font-bold tracking-widest">
              <div>Press <span className="text-cyber-text px-1 bg-cyber-border rounded">TAB + ENTER</span> to restart</div>
              <div><b>{settings?.layout || 'AZERTY'}</b> {settings?.language || 'FR'}</div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 bg-cyber-surface border border-cyber-border rounded-2xl"
          >
            <Trophy className="w-16 h-16 text-cyber-primary mb-6" />
            <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter">Session Summary</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
              <ResultCard label="WPM" value={stats.wpm} highlight />
              <ResultCard label="Accuracy" value={stats.accuracy + '%'} />
              <ResultCard label="Errors" value={stats.errors} />
              <ResultCard label="Duration" value={stats.timeElapsed + 's'} />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleRestart}
                className="px-10 py-4 bg-cyber-primary text-cyber-bg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Restart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="flex flex-col gap-8">
        <div className="card">
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyber-text-muted mb-4 font-bold">Target Intelligence</div>
          <div className="text-[13px] mb-4 text-cyber-text">Focusing on problematic characters</div>
          
          <div className="grid grid-cols-10 gap-1 mb-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "aspect-square rounded-[2px] bg-cyber-border",
                  i === 11 && "bg-cyber-error",
                  [0, 2, 3, 6, 9].includes(i) && "bg-cyber-primary opacity-40",
                  [5, 13, 18].includes(i) && "bg-cyber-warning opacity-60"
                )} 
              />
            ))}
          </div>
          <div className="text-[11px] text-cyber-text-muted">
            Recent challenges on: <b className="text-cyber-error">W</b>, <b className="text-cyber-warning">Q</b>
          </div>
        </div>

        <div className="card">
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyber-text-muted mb-6 font-bold">Daily Challenges</div>
          
          <div className="flex flex-col gap-4">
            <ChallengeItem icon="⚡" title="Speedster Streak" progress={75} />
            <ChallengeItem icon="🎯" title="100% Accuracy" progress={40} />
          </div>
        </div>
      </aside>
    </div>
  );
};

const ChallengeItem = ({ icon, title, progress }: { icon: string, title: string, progress: number }) => (
  <div className="flex items-center gap-4">
    <div className="w-8 h-8 rounded-md bg-cyber-border flex items-center justify-center text-sm">{icon}</div>
    <div className="flex-1">
      <div className="text-[12px] font-bold text-cyber-text">{title}</div>
      <div className="w-full h-1 bg-cyber-border rounded-full mt-1.5 overflow-hidden">
        <div className="h-full bg-cyber-primary rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  </div>
);

const ResultCard = ({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) => (
  <div className="flex flex-col items-center">
    <span className="text-[11px] text-cyber-text-muted uppercase tracking-widest mb-2 font-bold">{label}</span>
    <span className={cn(
      "text-4xl font-light",
      highlight && "text-cyber-primary font-bold"
    )}>{value}</span>
  </div>
);

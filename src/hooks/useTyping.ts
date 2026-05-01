import { useState, useCallback, useEffect, useRef } from 'react';
import { TYPING_QUOTES } from '../constants';

export type GameStatus = 'READY' | 'RUNNING' | 'FINISHED';

interface Stats {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  charErrors: Record<string, number>;
}

export function useTyping(language: 'FR' | 'EN' = 'FR', mode: string = 'standard') {
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<GameStatus>('READY');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({
    wpm: 0,
    cpm: 0,
    accuracy: 100,
    errors: 0,
    timeElapsed: 0,
    charErrors: {}
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateText = useCallback(async () => {
    // Basic AI adaptation: Get errors from stats (or DB in real app)
    // For now we use the current session's charErrors
    const problematicChars = Object.entries(stats.charErrors)
      .filter(([_, count]) => (count as number) > 0)
      .map(([char]) => char);

    const quotes = TYPING_QUOTES[language];
    let quote = quotes[Math.floor(Math.random() * quotes.length)];

    // If we have problematic characters, try to find a quote that contains them
    if (problematicChars.length > 0) {
      const candidates = quotes.filter(q => 
        problematicChars.some(char => q.toLowerCase().includes(char.toLowerCase()))
      );
      if (candidates.length > 0) {
        quote = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    setTargetText(quote);
    setUserInput('');
    setStatus('READY');
    setStartTime(null);
    setStats({
      wpm: 0,
      cpm: 0,
      accuracy: 100,
      errors: 0,
      timeElapsed: 0,
      charErrors: stats.charErrors // Preserve errors for next round
    });
  }, [language, stats.charErrors]);

  // Initial generation
  useEffect(() => {
    generateText();
  }, [generateText]);

  const calculateStats = useCallback(() => {
    if (!startTime) return;

    const timeInMinutes = (Date.now() - startTime) / 60000;
    const wordsTyped = userInput.length / 5;
    const currentWpm = Math.round(wordsTyped / timeInMinutes) || 0;
    const currentCpm = Math.round(userInput.length / timeInMinutes) || 0;

    // Accuracy
    let errors = 0;
    const charErrors: Record<string, number> = { ...stats.charErrors };

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== targetText[i]) {
        errors++;
        const targetChar = targetText[i];
        charErrors[targetChar] = (charErrors[targetChar] || 0) + 1;
      }
    }

    const accuracy = Math.max(0, Math.round(((userInput.length - errors) / userInput.length) * 100)) || 100;

    setStats(prev => ({
      ...prev,
      wpm: currentWpm,
      cpm: currentCpm,
      accuracy,
      errors,
      charErrors,
      timeElapsed: Math.floor((Date.now() - startTime) / 1000)
    }));
  }, [userInput, targetText, startTime, stats.charErrors]);

  const handleInput = (value: string) => {
    if (status === 'FINISHED') return;

    if (status === 'READY') {
      setStatus('RUNNING');
      setStartTime(Date.now());
    }

    setUserInput(value);

    if (value.length === targetText.length) {
      setStatus('FINISHED');
    }
  };

  useEffect(() => {
    if (status === 'RUNNING') {
      timerRef.current = setInterval(() => {
        calculateStats();
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, calculateStats]);

  return {
    targetText,
    userInput,
    status,
    stats,
    handleInput,
    reset: generateText
  };
}

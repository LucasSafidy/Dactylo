import React, { useState } from 'react';
import { useUser } from '../store/userContext';
import { motion } from 'motion/react';
import { Keyboard, User, ArrowRight, Github } from 'lucide-react';
import { cn } from '../lib/utils';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setError('');
    
    try {
      if (isLogin) {
        await login(username);
      } else {
        await register(username);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 selection:bg-cyber-primary selection:text-black">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="text-3xl font-black text-cyber-primary tracking-tighter mb-2">
            TYPE_PRO <span className="font-light opacity-50 text-base">| v1.2</span>
          </div>
          <div className="w-12 h-1 bg-cyber-primary/20 rounded-full mb-4"></div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyber-text-muted">Terminal Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-cyber-text-muted ml-1">Account Identifier</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="USERNAME"
                className="w-full bg-cyber-surface border border-cyber-border rounded-xl py-4 px-6 focus:outline-none focus:border-cyber-primary transition-all font-mono text-cyber-text placeholder:text-cyber-text-muted/30"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {error && (
            <div className="bg-cyber-error/10 border border-cyber-error/30 text-cyber-error text-[10px] px-4 py-3 rounded-lg font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-cyber-primary text-black font-black py-4 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,65,0.2)]"
          >
            {isLogin ? 'Access Terminal' : 'Register Identity'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold uppercase tracking-widest text-cyber-text-muted hover:text-cyber-primary transition-colors"
          >
            {isLogin ? "Need a new identity? register" : "Identity verified? login"}
          </button>
        </div>

        <div className="mt-20 border-t border-cyber-border pt-8 flex justify-between items-center opacity-30 grayscale">
          <div className="text-[9px] font-bold text-cyber-text-muted uppercase tracking-widest">v1.2.0-stable</div>
          <div className="text-[9px] font-bold text-cyber-text-muted uppercase tracking-widest">local storage active</div>
        </div>
      </motion.div>
    </div>
  );
};

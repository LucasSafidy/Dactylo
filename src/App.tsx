import React, { useState } from 'react';
import { UserProvider, useUser } from './store/userContext';
import { Shell } from './components/layout/Shell';
import { TypingEngine } from './components/typing/TypingEngine';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { Auth } from './pages/Auth';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState<'typing' | 'dashboard' | 'settings'>('typing');

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyber-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'typing' && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TypingEngine />
          </motion.div>
        )}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Dashboard />
          </motion.div>
        )}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SettingsPage />
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
};

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

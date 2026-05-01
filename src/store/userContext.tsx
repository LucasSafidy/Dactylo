import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, User, Settings, Session } from '../lib/db';

interface UserContextType {
  currentUser: User | null;
  settings: Settings | null;
  loading: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => void;
  updateXP: (amount: number) => Promise<void>;
  saveSession: (sessionData: Omit<Session, 'userId' | 'timestamp'>) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from last session (stored in localStorage just for the userId)
  useEffect(() => {
    const init = async () => {
      const savedUserId = localStorage.getItem('dactylo_userId');
      if (savedUserId) {
        const user = await db.users.get(Number(savedUserId));
        if (user) {
          setCurrentUser(user);
          const userSettings = await db.settings.where('userId').equals(user.id!).first();
          if (userSettings) setSettings(userSettings);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (username: string) => {
    const user = await db.users.where('username').equals(username).first();
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('dactylo_userId', user.id!.toString());
      const userSettings = await db.settings.where('userId').equals(user.id!).first();
      if (userSettings) setSettings(userSettings);
    } else {
      throw new Error('User not found');
    }
  };

  const register = async (username: string) => {
    const existing = await db.users.where('username').equals(username).first();
    if (existing) throw new Error('Username already exists');

    const newUser: User = {
      username,
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date(),
      joinedAt: new Date(),
      passwordHash: '', // Simplified for this demo
      goals: { wpm: 50, accuracy: 95 }
    };

    const id = await db.users.add(newUser);
    const user = { ...newUser, id };
    
    // Default settings
    const defaultSettings: Settings = {
      userId: id,
      layout: 'AZERTY',
      language: 'FR',
      theme: 'dark-pro',
      fontSize: 18,
      fontFamily: 'Inter',
      soundEnabled: true,
      focusMode: false
    };
    await db.settings.add(defaultSettings);

    setCurrentUser(user);
    setSettings(defaultSettings);
    localStorage.setItem('dactylo_userId', id.toString());
  };

  const logout = () => {
    setCurrentUser(null);
    setSettings(null);
    localStorage.removeItem('dactylo_userId');
  };

  const updateXP = async (amount: number) => {
    if (!currentUser) return;
    
    const newXP = currentUser.xp + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    
    const updatedUser = { 
      ...currentUser, 
      xp: newXP, 
      level: newLevel,
      lastActive: new Date()
    };
    
    await db.users.update(currentUser.id!, updatedUser);
    setCurrentUser(updatedUser);
  };

  const saveSession = async (sessionData: Omit<Session, 'userId' | 'timestamp'>) => {
    if (!currentUser) return;

    const session: Session = {
      ...sessionData,
      userId: currentUser.id!,
      timestamp: new Date()
    };

    await db.sessions.add(session);
    // XP calculation: wpm * accuracy / 10
    const xpGained = Math.round((session.wpm * session.accuracy) / 10);
    await updateXP(xpGained);
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings || !currentUser) return;
    const updated = { ...settings, ...newSettings };
    await db.settings.update(settings.id!, updated);
    setSettings(updated);
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      settings, 
      loading, 
      login, 
      register, 
      logout, 
      updateXP,
      saveSession,
      updateSettings
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

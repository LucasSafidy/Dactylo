import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
  avatar?: string;
  bio?: string;
  passwordHash: string;
  xp: number;
  level: number;
  streak: number;
  lastActive: Date;
  joinedAt: Date;
  goals: {
    wpm: number;
    accuracy: number;
  };
}

export interface Session {
  id?: number;
  userId: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  duration: number;
  mode: string;
  timestamp: Date;
  errors: {
    total: number;
    byCharacter: Record<string, number>;
    byFinger: Record<string, number>;
  };
}

export interface Achievement {
  id?: number;
  userId: number;
  type: string;
  name: string;
  description: string;
  unlockedAt: Date;
}

export interface Settings {
  id?: number;
  userId: number;
  layout: string; // 'AZERTY' | 'QWERTY'
  language: string; // 'FR' | 'EN'
  theme: string;
  fontSize: number;
  fontFamily: string;
  soundEnabled: boolean;
  focusMode: boolean;
}

export class DactyloDB extends Dexie {
  users!: Table<User>;
  sessions!: Table<Session>;
  achievements!: Table<Achievement>;
  settings!: Table<Settings>;

  constructor() {
    super('DactyloProDB');
    this.version(1).stores({
      users: '++id, username',
      sessions: '++id, userId, mode, timestamp',
      achievements: '++id, userId, type',
      settings: '++id, userId'
    });
  }
}

export const db = new DactyloDB();

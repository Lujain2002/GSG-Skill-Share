import React, { createContext, useContext, useEffect, useState } from 'react';
import { useThemeSettings } from '../theme/ThemeProvider';
import { DEFAULT_THEME_SETTINGS } from '../theme/constants';
import { loadSessions, saveSessions, loadLedger, saveLedger } from '../utils/storage';

const AuthContext = createContext(null);

const START_POINTS = 10;
const EARN_RATE_PER_30 = 5;
const API_URL = 'http://localhost:5044/api/Accounts';

export function AuthProvider({ children }) {
  const themeCtx = useThemeSettings();
  const [currentUser, setCurrentUser] = useState(null);
  const [sessions, setSessions] = useState(loadSessions());
  const [ledger, setLedger] = useState(loadLedger());
  const [users, setUsers] = useState([]);

  // ----------------- Helpers -----------------
  const uuid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

  const saveLocal = () => {
    saveSessions(sessions);
    saveLedger(ledger);
  };
  useEffect(saveLocal, [sessions, ledger]);

  const addLedger = (userId, type, amount, reason, relatedSessionId) => {
    setLedger(prev => [
      { id: uuid(), userId, type, amount, reason, relatedSessionId: relatedSessionId || null, timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const adjustPoints = (userId, delta) => {
    if (!currentUser || currentUser.id !== userId) return;
    setCurrentUser(u => ({ ...u, points: (u.points || 0) + delta }));
  };

  // ----------------- Users (directory) -----------------
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5044/api/Users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const list = await res.json();
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Users fetch failed:', e.message);
      setUsers([]);
    }
  };

  // ----------------- Auth -----------------
  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: name, email, password })
    });
    if (!res.ok) throw new Error(await res.text() || 'Registration failed');

    const data = await res.json(); 
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) setCurrentUser(data.user);
    // no auto-login on register in this flow
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text() || 'Invalid credentials');

    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

    if (data.user) setCurrentUser(data.user);
    // hydrate users directory after login so UI can resolve names
    fetchUsers();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUsers([]);
    if (themeCtx) {
      themeCtx.setPrimary(DEFAULT_THEME_SETTINGS.primary);
      themeCtx.setMode(DEFAULT_THEME_SETTINGS.mode);
    }
  };

  // Hydrate from localStorage on load (if user already logged)
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('user'));
      if (cached && cached.id) {
        setCurrentUser(cached);
        fetchUsers();
      }
    } catch {}
  }, []);

  // ----------------- Sessions -----------------
  const bookSession = ({ teacherId, learnerId, skill, durationMinutes = 30, scheduledAt }) => {
    if (!currentUser) throw new Error('Not logged in');
    const cost = (durationMinutes / 30) * EARN_RATE_PER_30;
    if ((currentUser.points || 0) < cost) throw new Error('Insufficient points');

    // Mirror backend anti-abuse rules locally
    const now = new Date();
    const dayWindow = new Date(now.getTime() - 24*60*60*1000);
    const weekWindow = new Date(now.getTime() - 7*24*60*60*1000);
    const MAX_CONCURRENT_SCHEDULED_PER_PAIR = 1;
    const MAX_DAILY_SESSIONS_PER_PAIR = 2;
    const MAX_WEEKLY_SESSIONS_PER_PAIR = 5;
    const COOLDOWN_DAYS_AFTER_MUTUAL_EXCHANGE = 14;
    const ALLOW_NEW_UNTAUGHT_SKILL_DURING_COOLDOWN = true;

    const pairSessions = sessions.filter(s =>
      (s.teacherId === teacherId && s.learnerId === learnerId) ||
      (s.teacherId === learnerId && s.learnerId === teacherId)
    );

    // Mutual exchange check (completed both directions)
    const completedPair = pairSessions.filter(s => s.status === 'completed');
    const aTaughtB = completedPair.some(s => s.teacherId === teacherId && s.learnerId === learnerId);
    const bTaughtA = completedPair.some(s => s.teacherId === learnerId && s.learnerId === teacherId);
    const mutualExchange = aTaughtB && bTaughtA;
    if (mutualExchange) {
      const lastCompleted = completedPair.reduce((acc, s) => {
        const t = new Date(s.completedAt || s.updatedAt || s.scheduledAt || s.createdAt || s.timestamp || now);
        return !acc || t > acc ? t : acc;
      }, null);
      const cooldownEnds = new Date((lastCompleted || now).getTime() + COOLDOWN_DAYS_AFTER_MUTUAL_EXCHANGE*24*60*60*1000);
      const inCooldown = now < cooldownEnds;
      if (inCooldown) {
        let allow = false;
        if (ALLOW_NEW_UNTAUGHT_SKILL_DURING_COOLDOWN) {
          const alreadyTaughtThisSkillDirection = completedPair.some(s => s.teacherId === teacherId && s.learnerId === learnerId && (s.skill === skill));
          if (!alreadyTaughtThisSkillDirection) allow = true;
        }
        if (!allow) {
          const leftMs = cooldownEnds.getTime() - now.getTime();
          const leftDays = Math.floor(leftMs / (24*60*60*1000));
          const leftHours = Math.floor((leftMs % (24*60*60*1000)) / (60*60*1000));
          throw new Error(`Cooldown active ${leftDays}d ${leftHours}h left. Book a new skill or wait.`);
        }
      }
    }

    // Limits
    const concurrentScheduled = pairSessions.filter(s => s.status === 'scheduled').length;
    if (concurrentScheduled >= MAX_CONCURRENT_SCHEDULED_PER_PAIR)
      throw new Error('Pair already has a scheduled session. Complete or cancel it before booking another.');

    const dailyCount = pairSessions.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= dayWindow).length;
    if (dailyCount >= MAX_DAILY_SESSIONS_PER_PAIR)
      throw new Error('Pair limit reached: max 2 sessions per 24h.');

    const weeklyCount = pairSessions.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= weekWindow).length;
    if (weeklyCount >= MAX_WEEKLY_SESSIONS_PER_PAIR)
      throw new Error('Pair limit reached: max 5 sessions per 7 days.');

    const session = {
      id: uuid(),
      teacherId,
      learnerId,
      skill,
      durationMinutes,
      status: 'scheduled',
      scheduledAt: scheduledAt || now.toISOString(),
      createdAt: now.toISOString()
    };
    setSessions(prev => [session, ...prev]);
    adjustPoints(learnerId, -cost);
    addLedger(learnerId, 'spend', -cost, `Booked session: ${skill}`, session.id);
    return session.id;
  };

  const completeSession = (sessionId) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed', completedAt: new Date().toISOString() } : s));
    const s = sessions.find(x => x.id === sessionId);
    if (!s || s.status === 'completed') return;
    const earn = (s.durationMinutes / 30) * EARN_RATE_PER_30;
    adjustPoints(s.teacherId, earn);
    addLedger(s.teacherId, 'earn', earn, `Taught ${s.skill}`, s.id);
  };

  const cancelSession = (sessionId) => {
    const s = sessions.find(x => x.id === sessionId);
    if (!s) return;
    setSessions(prev => prev.map(se => se.id === sessionId ? { ...se, status: 'cancelled' } : se));
    if (s.status === 'scheduled') {
      const refund = (s.durationMinutes / 30) * EARN_RATE_PER_30;
      adjustPoints(s.learnerId, refund);
      addLedger(s.learnerId, 'refund', refund, `Cancelled session: ${s.skill}`, s.id);
    }
  };

  const value = {
    currentUser,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    register,
    login,
    logout,
  users,
    sessions,
    bookSession,
    completeSession,
    cancelSession,
    ledger,
    addLedger,
    adjustPoints,
    constants: { START_POINTS, EARN_RATE_PER_30 }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Optional default export for consumers importing the whole module
export default {
  AuthProvider,
  useAuth
};

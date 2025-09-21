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

  // ----------------- Auth -----------------
  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: name, email, password })
    });
    if (!res.ok) throw new Error(await res.text() || 'Registration failed');

    const data = await res.json(); // ← المفترض ترجع الباك اند بيانات المستخدم + token
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) setCurrentUser(data.user); // ← استخدم مباشرة بيانات المستخدم
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text() || 'Invalid credentials');

    const data = await res.json();
    if (data.token) localStorage.setItem('user', JSON.stringify(data.user));
        

    if (data.user) setCurrentUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    if (themeCtx) {
      themeCtx.setPrimary(DEFAULT_THEME_SETTINGS.primary);
      themeCtx.setMode(DEFAULT_THEME_SETTINGS.mode);
    }
  };

  // ----------------- Sessions -----------------
  const bookSession = ({ teacherId, learnerId, skill, durationMinutes = 30, scheduledAt }) => {
    if (!currentUser) throw new Error('Not logged in');
    const cost = (durationMinutes / 30) * EARN_RATE_PER_30;
    if ((currentUser.points || 0) < cost) throw new Error('Insufficient points');

    const session = { id: uuid(), teacherId, learnerId, skill, durationMinutes, status: 'scheduled', scheduledAt: scheduledAt || new Date().toISOString() };
    setSessions(prev => [session, ...prev]);
    adjustPoints(learnerId, -cost);
    addLedger(learnerId, 'spend', -cost, `Booked session: ${skill}`, session.id);
    return session.id;
  };

  const completeSession = (sessionId) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed' } : s));
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

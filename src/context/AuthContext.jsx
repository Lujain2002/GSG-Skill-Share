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
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

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
  // Hydrate user from localStorage on first mount
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user');
      const rawToken = localStorage.getItem('token');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        // normalize shape
        setCurrentUser({
          canTeach: Array.isArray(parsed.canTeach) ? parsed.canTeach : [],
            wantLearn: Array.isArray(parsed.wantLearn) ? parsed.wantLearn : [],
          history: parsed.history || { taught: 0, learned: 0 },
          points: parsed.points || 0,
          ...parsed
        });
      } else if (rawToken) {
        // If only token exists you might optionally re-fetch user profile here.
      }
    } catch(e) { /* ignore */ }
  }, []);

  // Fetch self skills (authoritative backend) when currentUser first appears
  useEffect(() => {
    if (!currentUser?.id) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5044/api/UserSkills/${currentUser.id}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (!Array.isArray(data)) return;
        const teach = []; const learn = [];
        data.forEach(d => {
          const entry = { skill: d.skillName, level: ['Beginner','Intermediate','Advanced'][d.level] || 'Beginner', category: d.categoryName };
          if (d.type === 0) teach.push(entry); else learn.push(entry);
        });
        setCurrentUser(prev => prev ? { ...prev, canTeach: teach, wantLearn: learn } : prev);
      })
      .catch(()=>{});
  }, [currentUser?.id]);

  // Fetch all users (for matching) once current user + token available
  useEffect(() => {
    if (!currentUser) return; // wait until user known
    let abort = false;
    const token = localStorage.getItem('token');
    setUsersLoading(true);
    setUsersError('');
    fetch('http://localhost:5044/api/Users', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      .then(r => { if(!r.ok) throw new Error('Failed to load users'); return r.json(); })
      .then(data => {
        if (abort) return;
        // Normalize shape: ensure arrays and consistent fields
        const normalized = (Array.isArray(data)? data: []).map(u => ({
          id: u.id,
          name: u.name || u.username || u.userName || 'User',
          email: u.email,
          points: u.points || 0,
          avatarUrl: u.avatarUrl,
          bio: u.bio,
          location: u.location,
          canTeach: Array.isArray(u.canTeach) ? u.canTeach.map(s => ({
            skill: s.skill || s.Skill || '',
            level: s.level || s.Level || 'Beginner',
            category: s.category || s.Category || ''
          })) : [],
          wantLearn: Array.isArray(u.wantLearn) ? u.wantLearn.map(s => ({
            skill: s.skill || s.Skill || '',
            category: s.category || s.Category || ''
          })) : []
        }));
        setUsers(normalized);
      })
      .catch(e => { if(!abort) setUsersError(e.message || 'Error loading users'); })
      .finally(() => { if(!abort) setUsersLoading(false); });
    return () => { abort = true; };
  }, [currentUser]);

  // Sync logout/login across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        if (!localStorage.getItem('user')) {
          setCurrentUser(null);
        } else if (e.key === 'user' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setCurrentUser(prev => ({ ...prev, ...parsed }));
          } catch(_){}
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: name, email, password })
    });
    if (!res.ok) throw new Error(await res.text() || 'Registration failed');

    const data = await res.json(); // ← المفترض ترجع الباك اند بيانات المستخدم + token
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) {
      const normalized = {
        canTeach: Array.isArray(data.user.canTeach) ? data.user.canTeach : [],
        wantLearn: Array.isArray(data.user.wantLearn) ? data.user.wantLearn : [],
        history: data.user.history || { taught: 0, learned: 0 },
        points: data.user.points || 0,
        ...data.user
      };
      localStorage.setItem('user', JSON.stringify(normalized));
      setCurrentUser(normalized);
    }
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
    if (data.user) {
      const normalized = {
        canTeach: Array.isArray(data.user.canTeach) ? data.user.canTeach : [],
        wantLearn: Array.isArray(data.user.wantLearn) ? data.user.wantLearn : [],
        history: data.user.history || { taught: 0, learned: 0 },
        points: data.user.points || 0,
        ...data.user
      };
      localStorage.setItem('user', JSON.stringify(normalized));
      setCurrentUser(normalized);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    // Local pairing anti-spam mirrors backend limits
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const WEEK = 7 * DAY;
    const MAX_CONCURRENT = 1;
    const MAX_DAILY = 2;
    const MAX_WEEKLY = 5;
    const pairSessions = sessions.filter(s =>
      (s.teacherId === teacherId && s.learnerId === learnerId) ||
      (s.teacherId === learnerId && s.learnerId === teacherId)
    );
    // Mutual exchange with cooldown & skill exemption
    const completed = pairSessions.filter(s => s.status === 'completed');
    const aTaughtB = completed.some(s => s.teacherId === teacherId && s.learnerId === learnerId);
    const bTaughtA = completed.some(s => s.teacherId === learnerId && s.learnerId === teacherId);
    const mutualExchange = aTaughtB && bTaughtA;
    const COOLDOWN_DAYS = 14;
    if (mutualExchange) {
      const lastCompleted = completed
        .filter(s => (s.teacherId === teacherId && s.learnerId === learnerId) || (s.teacherId === learnerId && s.learnerId === teacherId))
        .map(s => new Date(s.createdAt || s.scheduledAt).getTime()).sort((a,b)=>b-a)[0];
      const cooldownEnds = lastCompleted + COOLDOWN_DAYS*24*60*60*1000;
      const inCooldown = now < cooldownEnds;
      if (inCooldown) {
        const directionSkillAlreadyTaught = completed.some(s => s.teacherId === teacherId && s.learnerId === learnerId && (s.skill||'').toLowerCase() === skill.toLowerCase());
        if (directionSkillAlreadyTaught) {
          const remainingMs = cooldownEnds - now;
          const rd = Math.floor(remainingMs / (24*60*60*1000));
            const rh = Math.floor((remainingMs % (24*60*60*1000))/(60*60*1000));
          throw new Error(`Mutual exchange cooldown: ${rd}d ${rh}h left. Book a different new skill or wait.`);
        }
      }
    }
    const concurrent = pairSessions.filter(s => s.status === 'scheduled').length;
    if (concurrent >= MAX_CONCURRENT) throw new Error('Limit: only one scheduled session between this pair at a time.');
    const daily = pairSessions.filter(s => now - new Date(s.createdAt || s.scheduledAt || s.id).getTime() < DAY).length;
    if (daily >= MAX_DAILY) throw new Error('Daily pair limit reached (2 per 24h).');
    const weekly = pairSessions.filter(s => now - new Date(s.createdAt || s.scheduledAt || s.id).getTime() < WEEK).length;
    if (weekly >= MAX_WEEKLY) throw new Error('Weekly pair limit reached (5 per 7 days).');
    if ((currentUser.points || 0) < cost) throw new Error('Insufficient points');

    const session = { id: uuid(), teacherId, learnerId, skill, durationMinutes, status: 'scheduled', scheduledAt: scheduledAt || new Date().toISOString(), createdAt: new Date().toISOString() };
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
    refreshUser: async () => {
      if (!currentUser?.id) return;
      try {
        const token = localStorage.getItem('token');
        // Try dashboard endpoint first (has points)
        const res = await fetch(`http://localhost:5044/api/Dashboard/user/${currentUser.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(prev => {
            const merged = { ...prev, points: data.points, name: data.username || data.name || prev?.name, bio: data.bio, location: data.location, avatarUrl: data.avatarUrl };
            localStorage.setItem('user', JSON.stringify(merged));
            return merged;
          });
          return;
        }
        // fallback to Users endpoint
        const res2 = await fetch(`http://localhost:5044/api/Users/${currentUser.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res2.ok) {
          const data2 = await res2.json();
            setCurrentUser(prev => {
              const merged = { ...prev, points: data2.points, name: data2.name || prev?.name, bio: data2.bio, location: data2.location, avatarUrl: data2.avatarUrl };
              localStorage.setItem('user', JSON.stringify(merged));
              return merged;
            });
        }
      } catch(e){ /* silent */ }
    },
    refreshUserSkills: async () => {
      if (!currentUser?.id) return;
      const token = localStorage.getItem('token');
      try {
        const r = await fetch(`http://localhost:5044/api/UserSkills/${currentUser.id}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        if (!r.ok) return;
        const data = await r.json();
        const teach = []; const learn = [];
        data.forEach(d => {
          const entry = { skill: d.skillName, level: ['Beginner','Intermediate','Advanced'][d.level] || 'Beginner', category: d.categoryName };
          if (d.type === 0) teach.push(entry); else learn.push(entry);
        });
        setCurrentUser(prev => prev ? { ...prev, canTeach: teach, wantLearn: learn } : prev);
      } catch(_){}
    },
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
    users,
    usersLoading,
    usersError,
    constants: { START_POINTS, EARN_RATE_PER_30 }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

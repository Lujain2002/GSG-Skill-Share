import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useThemeSettings } from '../theme/ThemeProvider';
import { DEFAULT_THEME_SETTINGS } from '../theme/constants';
import { loadUsers, saveUsers, getCurrentUserId, setCurrentUserId, loadSessions, saveSessions, loadLedger, saveLedger } from '../utils/storage';
import { DEFAULT_CATEGORY } from '../utils/categories';

const AuthContext = createContext(null);

const START_POINTS = 10; // initial grant
const EARN_RATE_PER_30 = 5; // points per 30 minutes taught

function uuid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,9); }
function randomColor(){
  const colors = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#0d9488','#9333ea'];
  return colors[Math.floor(Math.random()*colors.length)];
}

export function AuthProvider({ children }) {
  const migrate = (usersRaw) => usersRaw.map(u => ({
    ...u,
    canTeach: (u.canTeach || []).map(s => ({ category: s.category || DEFAULT_CATEGORY, ...s })),
    wantLearn: (u.wantLearn || []).map(s => ({ category: s.category || DEFAULT_CATEGORY, ...s }))
  }));
  const [users, setUsers] = useState(migrate(loadUsers()));
  const [sessions, setSessions] = useState(loadSessions());
  const [ledger, setLedger] = useState(loadLedger());
  const [currentUserId, setCurrent] = useState(getCurrentUserId());

  const currentUser = users.find(u => u.id === currentUserId) || null;

  useEffect(() => { saveUsers(users); }, [users]);
  useEffect(() => { saveSessions(sessions); }, [sessions]);
  useEffect(() => { saveLedger(ledger); }, [ledger]);
  useEffect(() => { setCurrentUserId(currentUserId); }, [currentUserId]);

  const register = (name, email, password) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already registered');
  const user = { id: uuid(), name, email, password, canTeach: [], wantLearn: [], points: START_POINTS, history: { taught:0, learned:0 }, profile: { bio:'', location:'', avatarColor: randomColor(), avatarUrl: null } };
    setUsers(prev => [...prev, user]);
    addLedger(user.id, 'grant', START_POINTS, 'Initial grant');
    setCurrent(user.id);
  };

  const login = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    setCurrent(user.id);
  };

  const themeCtx = useThemeSettings();
  const logout = () => {
    setCurrent(null);
    // reset theme to defaults when no user logged in
    if(themeCtx){
      themeCtx.setPrimary(DEFAULT_THEME_SETTINGS.primary);
      themeCtx.setMode(DEFAULT_THEME_SETTINGS.mode);
    }
  };

  const updateSkills = (userId, { canTeach, wantLearn }) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, canTeach, wantLearn } : u));
  };

  const addLedger = (userId, type, amount, reason, relatedSessionId) => {
    setLedger(prev => [{ id: uuid(), userId, type, amount, reason, relatedSessionId: relatedSessionId||null, timestamp: new Date().toISOString() }, ...prev]);
  };

  const adjustPoints = (userId, delta) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: u.points + delta } : u));
  };

  // Booking a session (learner initiates)
  const bookSession = ({ teacherId, learnerId, skill, durationMinutes = 30, scheduledAt }) => {
    const teacher = users.find(u => u.id === teacherId);
    const learner = users.find(u => u.id === learnerId);
    if (!teacher || !learner) throw new Error('Invalid participants');
    const cost = (durationMinutes/30) * EARN_RATE_PER_30; // learner cost = teacher earn
    if (learner.points < cost) throw new Error('Insufficient points');
    const session = { id: uuid(), teacherId, learnerId, skill, durationMinutes, status:'scheduled', scheduledAt: scheduledAt || new Date().toISOString() };
    setSessions(prev => [session, ...prev]);
    // Reserve (deduct now)
    adjustPoints(learnerId, -cost);
    addLedger(learnerId, 'spend', -cost, `Booked session: ${skill}` , session.id);
    return session.id;
  };

  const completeSession = (sessionId) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status:'completed' } : s));
    const s = sessions.find(x => x.id === sessionId);
    if (!s || s.status === 'completed') return;
    const earn = (s.durationMinutes/30) * EARN_RATE_PER_30;
    adjustPoints(s.teacherId, earn);
    addLedger(s.teacherId, 'earn', earn, `Taught ${s.skill}`, s.id);
    setUsers(prev => prev.map(u => u.id === s.teacherId ? { ...u, history: { ...u.history, taught: u.history.taught + 1 } } : u));
    setUsers(prev => prev.map(u => u.id === s.learnerId ? { ...u, history: { ...u.history, learned: u.history.learned + 1 } } : u));
  };

  const cancelSession = (sessionId) => {
    const s = sessions.find(x => x.id === sessionId);
    if (!s) return;
    setSessions(prev => prev.map(ses => ses.id === sessionId ? { ...ses, status:'cancelled' } : ses));
    if (s.status === 'scheduled') {
      // refund learner
      const refund = (s.durationMinutes/30) * EARN_RATE_PER_30;
      adjustPoints(s.learnerId, refund);
      addLedger(s.learnerId, 'refund', refund, `Cancelled session: ${s.skill}`, s.id);
    }
  };

  // ensure existing users have profile
  useEffect(()=>{
    setUsers(prev => prev.map(u => u.profile ? { ...u, profile: { bio: u.profile.bio||'', location: u.profile.location||'', avatarColor: u.profile.avatarColor || randomColor(), avatarUrl: ('avatarUrl' in u.profile) ? u.profile.avatarUrl : null, theme: u.profile.theme || null } } : { ...u, profile: { bio:'', location:'', avatarColor: randomColor(), avatarUrl: null, theme: null } }));
  }, []);

  // Apply user theme on login/change
  useEffect(()=>{
    if (currentUser?.profile?.theme && themeCtx) {
      const { primary, mode } = currentUser.profile.theme;
      if (primary) themeCtx.setPrimary(primary);
      if (mode) themeCtx.setMode(mode);
    }
  }, [currentUserId]);

  // Whenever theme settings change, persist them to the current user's profile automatically (if logged in)
  useEffect(()=>{
    if(currentUser && themeCtx){
      updateProfile(currentUser.id, { theme: { primary: themeCtx.settings.primary, mode: themeCtx.settings.mode } });
    }
  }, [themeCtx?.settings.primary, themeCtx?.settings.mode]);

  const updateProfile = (userId, data) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, profile: { ...u.profile, ...data } } : u));
  };

  const value = {
    users, currentUser, currentUserId,
    register, login, logout, updateSkills,
    sessions, bookSession, completeSession, cancelSession,
    ledger: ledger.filter(l => !currentUserId || l.userId === currentUserId),
    fullLedger: ledger,
    addLedger, adjustPoints, updateProfile,
    constants: { START_POINTS, EARN_RATE_PER_30 }
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

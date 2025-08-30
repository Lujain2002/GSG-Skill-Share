// Local storage persistence helpers
const KEY_USERS = 'ss_users';
const KEY_SESSIONS = 'ss_sessions';
const KEY_LEDGER = 'ss_ledger';
const KEY_CURRENT = 'ss_currentUserId';
const KEY_THEME = 'ss_theme';

const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export function loadUsers() { return read(KEY_USERS, []); }
export function saveUsers(users) { write(KEY_USERS, users); }
export function loadSessions() { return read(KEY_SESSIONS, []); }
export function saveSessions(s) { write(KEY_SESSIONS, s); }
export function loadLedger() { return read(KEY_LEDGER, []); }
export function saveLedger(l) { write(KEY_LEDGER, l); }
export function setCurrentUserId(id) { localStorage.setItem(KEY_CURRENT, id || ''); }
export function getCurrentUserId() { return localStorage.getItem(KEY_CURRENT) || null; }

export function loadTheme() { return read(KEY_THEME, { mode:'dark', primary:'#2563eb' }); }
export function saveTheme(t) { write(KEY_THEME, t); }

export function resetAll() {
  [KEY_USERS, KEY_SESSIONS, KEY_LEDGER, KEY_CURRENT, KEY_THEME].forEach(k => localStorage.removeItem(k));
}

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../utils/matching';
import { SKILL_CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories';

export default function Matches({ onBook }) {
  const { users = [], currentUser, usersLoading, usersError, sessions = [] } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [hideExchanged, setHideExchanged] = useState(true);

  const matchesRaw = useMemo(() => {
    if (!currentUser) return [];
    const computed = getMatches(currentUser, users);
    if (showAll) {
      // Include zero-score users (those filtered out by getMatches) for discovery
      const existingIds = new Set(computed.map(m=>m.user.id));
      const zeroes = users
        .filter(u => u && u.id !== currentUser.id && !existingIds.has(u.id))
        .map(u => ({ user: u, score: 0 }));
      return [...computed, ...zeroes];
    }
    return computed;
  }, [currentUser, users, showAll]);

  // Filter out pairs that already mutually exchanged (each completed at least one session teaching the other)
  // Since we don't yet persist sessions from backend in users, this is a placeholder hook for future integration.

  const exchangedMap = useMemo(() => {
    // Build map of userId -> fullyExchanged boolean (mutual completed sessions, within cooldown)
    if (!currentUser) return {};
    const map = {};
    const COOLDOWN_MS = 14*24*60*60*1000; // align with backend
    users.forEach(u => {
      if (!u || u.id === currentUser.id) return;
      const pair = sessions.filter(s => (s.teacherId === u.id && s.learnerId === currentUser.id) || (s.teacherId === currentUser.id && s.learnerId === u.id));
      const completed = pair.filter(s => s.status === 'completed');
      const aTaughtB = completed.some(s => s.teacherId === currentUser.id && s.learnerId === u.id);
      const bTaughtA = completed.some(s => s.teacherId === u.id && s.learnerId === currentUser.id);
      if (aTaughtB && bTaughtA) {
        const lastCompleted = completed.map(s => new Date(s.createdAt || s.scheduledAt).getTime()).sort((a,b)=>b-a)[0];
        const inCooldown = Date.now() - lastCompleted < COOLDOWN_MS;
        if (inCooldown) map[u.id] = true;
      }
    });
    return map;
  }, [sessions, users, currentUser]);

  const filtered = useMemo(() => {
    let list = matchesRaw;
    if (categoryFilter !== 'All') {
      list = list.filter(m => m.user.canTeach.some(s => s.category === categoryFilter));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m => m.user.name.toLowerCase().includes(q) ||
        m.user.canTeach.some(s => s.skill.toLowerCase().includes(q)) ||
        m.user.wantLearn.some(s => s.skill.toLowerCase().includes(q))
      );
    }
    if (hideExchanged) {
      list = list.filter(m => !exchangedMap[m.user.id]);
    }
    return list;
  }, [matchesRaw, categoryFilter, search, hideExchanged, exchangedMap]);

  if (!currentUser) {
    return <div className="card matches"><div className="muted small">Loading matches…</div></div>;
  }

  if (usersLoading) {
    return <div className="card matches"><div className="muted small">Loading community users…</div></div>;
  }

  if (usersError) {
    return <div className="card matches"><div className="error small" style={{color:'var(--danger-color)'}}>Error: {usersError}</div></div>;
  }

  return (
    <div className="card matches">
      <div className="matches-head">
        <h3>Matches</h3>
        <p className="muted small">People whose skills complement yours. Filter to refine and book a session.</p>
      </div>
      <div className="matches-filters">
        <div className="filter-group">
          <label className="visually-hidden" htmlFor="match-category">Category</label>
          <select id="match-category" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {SKILL_CATEGORIES.concat([DEFAULT_CATEGORY]).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group grow">
          <label className="visually-hidden" htmlFor="match-search">Search</label>
            <input id="match-search" type="text" value={search} placeholder="Search name or skill" onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <label className="visually-hidden" htmlFor="show-all-matches">Show all</label>
          <button type="button" className={showAll? 'btn-small active':'btn-small'} onClick={()=>setShowAll(s=>!s)}>
            {showAll? 'Hide zero-score':'Show all users'}
          </button>
        </div>
        <div className="filter-group">
          <label className="visually-hidden" htmlFor="hide-exchanged">Hide exchanged</label>
          <button type="button" className={hideExchanged? 'btn-small active':'btn-small'} onClick={()=>setHideExchanged(h=>!h)}>
            {hideExchanged? 'Show exchanged':'Hide exchanged'}
          </button>
        </div>
        <div className="filter-meta small muted">{filtered.length} result{filtered.length!==1 && 's'}</div>
      </div>
      {filtered.length === 0 && (
        <div className="muted" style={{marginTop:'.75rem'}}>
          No matches yet.
          <ul style={{marginTop:'.4rem', paddingLeft:'1rem'}}>
            <li>Add overlapping skills (your Learn vs their Teach)</li>
            <li>Click "Show all users" to discover potential partners</li>
            <li>Add more specific skill names</li>
          </ul>
        </div>
      )}
      <div className="matches-grid">
        {filtered.map(m => {
          const learnTheyTeach = (currentUser.wantLearn||[]).filter(ls => (m.user.canTeach||[]).some(ts => ts.skill.toLowerCase() === ls.skill.toLowerCase()));
          const teachTheyWant = (currentUser.canTeach||[]).filter(ts => (m.user.wantLearn||[]).some(ls => ls.skill.toLowerCase() === ts.skill.toLowerCase()));
          const showList = (arr, variant) => {
            if (!arr.length) return <span className="none muted">—</span>;
            const display = arr.slice(0,4);
            const more = arr.length - display.length;
            return <>
              {display.map(s => <span key={s.skill+variant} className={`overlap-chip ${variant}`}>{s.skill}</span>)}
              {more>0 && <span className="overlap-chip more">+{more}</span>}
            </>;
          };
          return (
            <div key={m.user.id} className={`match-card ${exchangedMap[m.user.id]? 'exchanged':''}`.trim()}>
              <div className="match-card-head">
                <div className="avatar" aria-hidden>{m.user.name.charAt(0).toUpperCase()}</div>
                <div className="meta">
                  <div className="name">{m.user.name}</div>
                  <div className="score-row">
                    <span className="score-badge">Score {m.score}</span>
                    {exchangedMap[m.user.id] && <span className="score-badge" style={{background:'var(--border-alt)', color:'var(--text-muted)'}}>Exchanged</span>}
                  </div>
                </div>
              </div>
              <div className="overlaps">
                <div className="col">
                  <div className="label small">You Learn / They Teach</div>
                  <div className="chips">{showList(learnTheyTeach,'learn')}</div>
                </div>
                <div className="col">
                  <div className="label small">You Teach / They Learn</div>
                  <div className="chips">{showList(teachTheyWant,'teach')}</div>
                </div>
              </div>
              <div className="teach-summary small">
                <span className="muted">Teaches:</span> {(m.user.canTeach||[]).slice(0,6).map(s=>s.skill).join(', ') || '—'}
              </div>
              <div className="actions">
                <button onClick={()=>onBook(m.user)}>Book Session</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

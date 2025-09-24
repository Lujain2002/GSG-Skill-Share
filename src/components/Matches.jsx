import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../utils/matching';
import { SKILL_CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories';

export default function Matches({ onBook }) {
  const { users = [], currentUser, sessions = [] } = useAuth() || {};
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [hideExchanged, setHideExchanged] = useState(true);

  const matchesRaw = getMatches(currentUser, users);

  // Compute exchanged pairs within cooldown (14 days) using local sessions
  const exchangedMap = useMemo(() => {
    const map = new Map();
    if (!currentUser) return map;
    const now = new Date();
    const windowStart = new Date(now.getTime() - 14*24*60*60*1000);
    const completed = (sessions || []).filter(s => s.status === 'completed' && new Date(s.completedAt || s.createdAt || s.scheduledAt || now) >= windowStart);
    for (const s of completed) {
      const aTaughtB = s.teacherId;
      const bLearned = s.learnerId;
      const keyAB = `${aTaughtB}|${bLearned}`;
      map.set(keyAB, true);
    }
    return map;
  }, [sessions, currentUser]);

  const isExchangedPair = (otherUserId) => {
    if (!currentUser) return false;
    const aTaughtB = exchangedMap.get(`${currentUser.id}|${otherUserId}`);
    const bTaughtA = exchangedMap.get(`${otherUserId}|${currentUser.id}`);
    return !!(aTaughtB && bTaughtA);
  };

  const matches = useMemo(() => {
    if (!currentUser || !Array.isArray(matchesRaw)) return [];
    let list = Array.isArray(matchesRaw) ? matchesRaw : [];
    if (categoryFilter !== 'All') {
      list = list.filter(m => m.user.canTeach.some(s => s.category === categoryFilter));
    }
    if (hideExchanged) {
      list = list.filter(m => !isExchangedPair(m.user.id));
    }
    return list;
  }, [matchesRaw, categoryFilter, hideExchanged]);
  if (!currentUser) {
    return <div className="card"><h3>Matches</h3><div className="muted">Please log in to see matches.</div></div>;
  }
  return (
    <div className="card">
      <h3>Matches</h3>
      <div style={{display:'flex', gap:'.6rem', flexWrap:'wrap', marginBottom:'.75rem'}}>
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} aria-label="Filter by category">
          <option value="All">All Categories</option>
          {SKILL_CATEGORIES.concat([DEFAULT_CATEGORY]).map(c => <option key={c}>{c}</option>)}
        </select>
        <label style={{display:'inline-flex', alignItems:'center', gap:'.4rem'}}>
          <input type="checkbox" checked={hideExchanged} onChange={e=>setHideExchanged(e.target.checked)} /> Hide exchanged pairs
        </label>
      </div>
      {matches.length === 0 && <div className="muted">No matches yet. Add more skills.</div>}
      <div className="panels" style={{gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))'}}>
        {matches.map(m => {
          const exchanged = isExchangedPair(m.user.id);
          return (
          <div key={m.user.id} className={`card match-card ${exchanged ? 'exchanged' : ''}`} style={{borderColor:'#263240', position:'relative'}}>
            <strong>{m.user.name}</strong>
            <div style={{fontSize:'.7rem'}}>Score: {m.score}</div>
            <div style={{fontSize:'.7rem'}}>
              Teaches: {m.user.canTeach.map(s=>`${s.skill}${s.category ? ' ('+s.category.split(' ')[0]+')':''}`).join(', ') || '—'}<br/>
              Wants: {m.user.wantLearn.map(s=>s.skill).join(', ') || '—'}
            </div>
            {exchanged && <span className="badge" style={{position:'absolute', top:8, right:8, fontSize:'.65rem', background:'#334155', padding:'.2rem .4rem', borderRadius:4}}>Exchanged</span>}
            <button onClick={()=>onBook(m.user)} disabled={exchanged && hideExchanged}>Book Session</button>
          </div>
        );})}
      </div>
    </div>
  );
}

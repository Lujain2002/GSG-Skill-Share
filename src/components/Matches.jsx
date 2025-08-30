import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../utils/matching';
import { SKILL_CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories';

export default function Matches({ onBook }) {
  const { users, currentUser } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const matchesRaw = getMatches(currentUser, users);
  const matches = useMemo(() => {
    if (categoryFilter === 'All') return matchesRaw;
    return matchesRaw.filter(m => m.user.canTeach.some(s => s.category === categoryFilter));
  }, [matchesRaw, categoryFilter]);
  return (
    <div className="card">
      <h3>Matches</h3>
      <div style={{display:'flex', gap:'.6rem', flexWrap:'wrap', marginBottom:'.75rem'}}>
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} aria-label="Filter by category">
          <option value="All">All Categories</option>
          {SKILL_CATEGORIES.concat([DEFAULT_CATEGORY]).map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      {matches.length === 0 && <div className="muted">No matches yet. Add more skills.</div>}
      <div className="panels" style={{gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))'}}>
        {matches.map(m => (
          <div key={m.user.id} className="card" style={{borderColor:'#263240'}}>
            <strong>{m.user.name}</strong>
            <div style={{fontSize:'.7rem'}}>Score: {m.score}</div>
            <div style={{fontSize:'.7rem'}}>
              Teaches: {m.user.canTeach.map(s=>`${s.skill}${s.category ? ' ('+s.category.split(' ')[0]+')':''}`).join(', ') || '—'}<br/>
              Wants: {m.user.wantLearn.map(s=>s.skill).join(', ') || '—'}
            </div>
            <button onClick={()=>onBook(m.user)}>Book Session</button>
          </div>
        ))}
      </div>
    </div>
  );
}

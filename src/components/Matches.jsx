import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../utils/matching';
import { SKILL_CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories';

export default function Matches({ onBook }) {
  const { users, currentUser } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const matchesRaw = getMatches(currentUser, users); // logic preserved

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
    return list;
  }, [matchesRaw, categoryFilter, search]);

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
        <div className="filter-meta small muted">{filtered.length} result{filtered.length!==1 && 's'}</div>
      </div>
      {filtered.length === 0 && <div className="muted" style={{marginTop:'.75rem'}}>No matches yet. Add more skills or adjust filters.</div>}
      <div className="matches-grid">
        {filtered.map(m => {
          const learnTheyTeach = currentUser.wantLearn.filter(ls => m.user.canTeach.some(ts => ts.skill.toLowerCase() === ls.skill.toLowerCase()));
          const teachTheyWant = currentUser.canTeach.filter(ts => m.user.wantLearn.some(ls => ls.skill.toLowerCase() === ts.skill.toLowerCase()));
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
            <div key={m.user.id} className="match-card">
              <div className="match-card-head">
                <div className="avatar" aria-hidden>{m.user.name.charAt(0).toUpperCase()}</div>
                <div className="meta">
                  <div className="name">{m.user.name}</div>
                  <div className="score-row"><span className="score-badge">Score {m.score}</span></div>
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
                <span className="muted">Teaches:</span> {m.user.canTeach.slice(0,6).map(s=>s.skill).join(', ') || '—'}
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

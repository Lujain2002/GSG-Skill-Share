import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Helpers
function fmt(n){ return Number.isFinite(n) ? n.toLocaleString() : '0'; }
function percent(part, total){ if(total===0) return '0%'; const p = (part/total)*100; return p < 1 && part>0 ? '<1%' : Math.round(p)+'%'; }

const API_BASE = 'http://localhost:5044';

export default function Dashboard() {
  const { currentUser, users = [], sessions = [], ledger = [], refreshUser } = useAuth();
  // Backend sourced skills (teach/learn) for Skills Overview
  const [teachSkills, setTeachSkills] = useState([]); // [{skill, level, categoryName}]
  const [learnSkills, setLearnSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState('');

  // Loading / unauth guard
  if (!currentUser) {
    return <div className="card dash-card"><div className="muted" style={{fontSize:'.8rem'}}>Loading dashboard…</div></div>;
  }

  const safeHistory = currentUser.history || { taught: 0, learned: 0 };

  // Refresh latest points & profile minimal info once on mount
  useEffect(() => {
    refreshUser && refreshUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user skills from backend (authoritative source) when user changes
  useEffect(() => {
    if (!currentUser?.id) return;
    let abort = false;
    setSkillsLoading(true);
    setSkillsError('');
    fetch(`${API_BASE}/api/UserSkills/${currentUser.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load skills');
        return r.json();
      })
      .then(data => {
        if (abort) return;
        const teach = [];
        const learn = [];
        data.forEach(d => {
          const entry = {
            id: d.userSkillId || d.id,
            skill: d.skillName,
            // backend Level is an enum int: 0 Beginner, 1 Intermediate, 2 Advanced (mirroring SkillEditor mapping)
            level: ['Beginner','Intermediate','Advanced'][d.level] || 'Any',
            categoryId: d.categoryId,
            categoryName: d.categoryName
          };
          if (d.type === 0) teach.push(entry); else learn.push(entry);
        });
        setTeachSkills(teach);
        setLearnSkills(learn);
      })
      .catch(e => { if(!abort){ setSkillsError(e.message || 'Error loading skills'); } })
      .finally(() => { if(!abort) setSkillsLoading(false); });
    return () => { abort = true; };
  }, [currentUser]);

  const mySessions = useMemo(() => sessions.filter(s => s && (s.teacherId===currentUser.id || s.learnerId===currentUser.id)), [sessions, currentUser.id]);
  const recentSessions = mySessions.slice(0,5);
  const upcoming = mySessions.filter(s=> s.status==='scheduled').slice(0,3);
  const recentLedger = ledger.slice(0,6);
  const teachCount = teachSkills.length;
  const learnCount = learnSkills.length;
  const totalSkills = teachCount + learnCount;
  const teachPct = percent(teachCount, totalSkills||1);
  const learnPct = percent(learnCount, totalSkills||1);
  const communitySize = users.length;

  return (
    <div className="dashboard" style={{display:'flex', flexDirection:'column', gap:'1.4rem'}}>
      {/* Welcome + stats */}
  <div className="card dash-card" style={{padding:'1.45rem 1.5rem 1.6rem', position:'relative'}}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'1.25rem', alignItems:'flex-start'}}>
          <div style={{flex:'1 1 240px', minWidth:240}}>
            <h3 style={{margin:'0 0 .7rem', fontSize:'1.15rem', letterSpacing:'.3px'}}>Welcome back</h3>
            <div style={{fontSize:'.9rem', lineHeight:1.55}}>
              <strong>{currentUser.name}</strong><br/>
              Points balance: <strong>{fmt(currentUser.points||0)}</strong><br/>
              Sessions taught: {safeHistory.taught} · learned: {safeHistory.learned}<br/>
              Community: {communitySize} users
            </div>
          </div>
          <div className="stat-grid" style={{flex:'2 1 480px'}}>
            <StatCard
              label="Points"
              value={currentUser.points||0}
              subLabel="Potential (hrs teach)"
              subValue={`${Math.floor((currentUser.points||0) / 5)*0.5}h @5/30m`}
              accent="var(--surface-accent2)"
              barColor="#6366f1" barColorTo="#818cf8" />
            <StatCard
              label="Can Teach"
              value={teachCount}
              subLabel="Share of total"
              subValue={teachPct}
              accent="var(--surface-accent)"
              barColor="#059669" barColorTo="#10b981" />
            <StatCard
              label="Want Learn"
              value={learnCount}
              subLabel="Share of total"
              subValue={learnPct}
              accent="var(--surface-accent2)"
              barColor="#2563eb" barColorTo="#1d4ed8" />
            <StatCard
              label="My Sessions"
              value={mySessions.length}
              subLabel="Completed / Upcoming"
              subValue={`${mySessions.filter(s=>s.status==='completed').length} / ${mySessions.filter(s=>s.status==='scheduled').length}`}
              accent="var(--surface-alt)"
              barColor="#f59e0b" barColorTo="#fbbf24" />
          </div>
          <div style={{position:'absolute', bottom:8, right:14}}>
            <span style={{fontSize:'.6rem', opacity:.55}}>Teach/Learn % = proportion of your skills.</span>
          </div>
        </div>
      </div>

      {/* Skills + Upcoming + Ledger */}
      <div style={{display:'grid', gap:'1.35rem', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>
        <div className="card dash-card" style={{padding:'1.25rem 1.3rem 1.55rem'}}>
          <SectionHeader title="Skills Overview" />
          {skillsLoading && (
            <div className="muted" style={{fontSize:'.7rem'}}>Loading skills…</div>
          )}
          {!skillsLoading && (
            <>
              <div className="pill-row">
                <Pill label={`Teach: ${teachCount}`} tone="primary" />
                <Pill label={`Learn: ${learnCount}`} />
                <Pill label={`Total: ${totalSkills}`} />
              </div>
              <div style={{marginTop:'.95rem', fontSize:'.78rem', lineHeight:1.55}}>
                {skillsError && <div className="error" style={{color:'var(--danger-color)', fontSize:'.7rem'}}>{skillsError}</div>}
                {!skillsError && (
                  <>
                    {teachCount>0 ? (
                      <>
                        <strong>Teaching:</strong> {teachSkills.map(s=>s.skill).slice(0,8).join(', ') || '—'}{teachCount>8 && ' …'}<br/>
                      </>
                    ): <span className="muted">Add skills you can teach.</span>}
                    {learnCount>0 ? (
                      <>
                        <strong>Learning:</strong> {learnSkills.map(s=>s.skill).slice(0,8).join(', ') || '—'}{learnCount>8 && ' …'}
                      </>
                    ): <div className="muted" style={{marginTop:'.25rem'}}>Add skills you want to learn.</div>}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <div className="card dash-card" style={{padding:'1.25rem 1.3rem 1.55rem'}}>
          <SectionHeader title="Upcoming Sessions" />
          {upcoming.length === 0 && <div className="muted" style={{fontSize:'.75rem'}}>No scheduled sessions.</div>}
          <ul className="mini-list">
            {upcoming.map(s => (
              <li key={s.id} className="mini-item">
                <div style={{fontSize:'.82rem', fontWeight:600}}>{s.skill}</div>
                <div style={{fontSize:'.72rem', opacity:.85}}>Role: {s.teacherId===currentUser.id? 'Teacher':'Learner'} · {s.durationMinutes}m</div>
                <div style={{fontSize:'.65rem', opacity:.55}}>{new Date(s.scheduledAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card dash-card" style={{padding:'1.25rem 1.3rem 1.55rem'}}>
          <SectionHeader title="Recent Ledger" />
          {recentLedger.length === 0 && <div className="muted" style={{fontSize:'.75rem'}}>No activity yet.</div>}
          <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'.45rem'}}>
            {recentLedger.map(l => (
              <li key={l.id} className="ledger-mini">
                <span style={{flex:1}}>{l.reason}</span>
                <span className={l.amount>=0? 'amt-pos':'amt-neg'}>{l.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card dash-card" style={{padding:'1.3rem 1.35rem 1.6rem'}}>
        <SectionHeader title="Recent Sessions" />
        {recentSessions.length === 0 && <div className="muted" style={{fontSize:'.75rem'}}>No sessions yet.</div>}
        {recentSessions.length>0 && (
          <div style={{overflowX:'auto'}}>
            <table className="data-table" style={{minWidth:520}}>
              <thead>
                <tr><th style={{textAlign:'left'}}>Skill</th><th>Role</th><th>Duration</th><th>Status</th><th>When</th></tr>
              </thead>
              <tbody>
                {recentSessions.map(s => (
                  <tr key={s.id} className="dash-row">
                    <td>{s.skill}</td>
                    <td>{s.teacherId===currentUser.id? 'Teacher':'Learner'}</td>
                    <td>{s.durationMinutes}m</td>
                    <td><span className={'status '+s.status}>{s.status}</span></td>
                    <td>{new Date(s.scheduledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subLabel, subValue, accent, barColor, barColorTo }) {
  return (
    <div className="stat-card accent-bar" style={{boxShadow:`0 0 0 1px ${accent}33, 0 4px 18px -6px ${accent}40`, '--accent-color':barColor, '--accent-color-to':barColorTo}}>
      <small style={{opacity:.85, fontWeight:600}}>{label}</small>
      <span className="value">{value}</span>
      {subLabel && (
        <span className="sub" style={{display:'flex', flexDirection:'column', gap:2}}>
          <span style={{fontSize:'.6rem', letterSpacing:'.5px', textTransform:'uppercase', opacity:.6}}>{subLabel}</span>
          <span style={{fontSize:'.7rem', fontWeight:500}}>{subValue}</span>
        </span>
      )}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.85rem'}}>
      <h3 style={{margin:0, fontSize:'.9rem', letterSpacing:'.3px'}}>{title}</h3>
    </div>
  );
}

function Pill({ label, tone }) {
  return <span className={tone==='primary'? 'pill-chip primary':'pill-chip'}>{label}</span>;
}

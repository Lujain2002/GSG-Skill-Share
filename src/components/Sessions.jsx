import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sessions() {
  const ctx = useAuth() || {};
  const sessions = ctx.sessions || [];
  const currentUser = ctx.currentUser || null;
  const users = ctx.users || [];
  const { completeSession, cancelSession } = ctx;
  if (!currentUser) return <div className="card"><h3>Sessions</h3><div className="muted">Please log in to view your sessions.</div></div>;
  const mine = (Array.isArray(sessions) ? sessions : []).filter(s => s && (s.teacherId === currentUser.id || s.learnerId === currentUser.id));
  return (
    <div className="card">
      <h3>Sessions</h3>
      <table>
        <thead>
          <tr><th>Skill</th><th>Teacher</th><th>Learner</th><th>Duration</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {Array.isArray(mine) && mine.map(s => {
            const teacher = Array.isArray(users) ? users.find(u => u?.id === s.teacherId) : null;
            const learner = Array.isArray(users) ? users.find(u => u?.id === s.learnerId) : null;
            return (
              <tr key={s.id}>
                <td>{s.skill}</td>
                <td>{teacher?.name || teacher?.username || teacher?.email || s.teacherId}</td>
                <td>{learner?.name || learner?.username || learner?.email || s.learnerId}</td>
                <td>{s.durationMinutes}m</td>
                <td><span className={"status "+s.status}>{s.status}</span></td>
                <td style={{display:'flex',gap:'.3rem'}}>
                  {s.status==='scheduled' && teacher?.id === currentUser.id && <button type="button" onClick={()=>completeSession(s.id)}>Complete</button>}
                  {s.status==='scheduled' && (teacher?.id === currentUser.id || learner?.id === currentUser.id) && <button type="button" className="secondary" onClick={()=>cancelSession(s.id)}>Cancel</button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {mine.length === 0 && <div className="muted">No sessions yet.</div>}
    </div>
  );
}

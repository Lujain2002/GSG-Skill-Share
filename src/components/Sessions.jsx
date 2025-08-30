import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sessions() {
  const { sessions, currentUser, users, completeSession, cancelSession } = useAuth();
  const mine = sessions.filter(s => s.teacherId === currentUser.id || s.learnerId === currentUser.id);
  return (
    <div className="card">
      <h3>Sessions</h3>
      <table>
        <thead>
          <tr><th>Skill</th><th>Teacher</th><th>Learner</th><th>Duration</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {mine.map(s => {
            const teacher = users.find(u => u.id === s.teacherId);
            const learner = users.find(u => u.id === s.learnerId);
            return (
              <tr key={s.id}>
                <td>{s.skill}</td>
                <td>{teacher?.name}</td>
                <td>{learner?.name}</td>
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

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BookSessionModal({ teacher, onClose }) {
  const { currentUser, bookSession } = useAuth();
  const teachable = teacher.canTeach.map(s => s.skill);
  const relevant = teachable.filter(s => currentUser.wantLearn.some(w => w.skill.toLowerCase() === s.toLowerCase()));
  const [skill,setSkill] = useState(relevant[0] || teachable[0] || '');
  const [duration,setDuration] = useState(30);
  const [error,setError] = useState('');
  const [ok,setOk] = useState(false);
  const submit = e => { e.preventDefault();
    try { bookSession({ teacherId: teacher.id, learnerId: currentUser.id, skill, durationMinutes: duration }); setOk(true); }
    catch(err){ setError(err.message); }
  };
  if (!teacher) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',zIndex:50}}>
      <div className="card" style={{maxWidth:420,width:'100%',boxShadow:'0 10px 30px -10px #000'}}>
        <h3>Book Session with {teacher.name}</h3>
        {ok ? <>
          <div className="success">Session booked!</div>
          <button onClick={onClose}>Close</button>
        </> : <form onSubmit={submit} className="flexcol">
          <label>Skill
            <select value={skill} onChange={e=>setSkill(e.target.value)} required>
              {teacher.canTeach.map(s => <option key={s.skill}>{s.skill}</option>)}
            </select>
          </label>
          <label>Duration (minutes)
            <select value={duration} onChange={e=>setDuration(Number(e.target.value))}>
              {[30,60,90].map(d => <option key={d}>{d}</option>)}
            </select>
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit">Book</button>
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
        </form>}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BookSessionModal({ teacher, onClose }) {
  const { currentUser } = useAuth();
  const [skill, setSkill] = useState('');
  const [duration, setDuration] = useState(30);
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);


  const teachableSkills = teacher.teaches || teacher.canTeach || [];

  const bookSession = async (sessionData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5044/api/Sessions/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      const text = await response.text(); 
      if (!response.ok) {
        console.error('Server error:', text);
        throw new Error(JSON.parse(text)?.title || 'Failed to book session');
      }

      const result = JSON.parse(text);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!skill || !duration || !scheduledAt) {
      setError('Please fill all required fields');
      return;
    }

   
    const sessionData = {
      skillId: Number(skill),            
      teacherId: teacher.id,
      studentId: currentUser.id,
      duration: Number(duration),
      scheduledAt: new Date(scheduledAt).toISOString(),
    };

    console.log('sessionData:', sessionData);
    console.log('skillId type:', typeof sessionData.skillId);

    try {
      await bookSession(sessionData);
      setOk(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!teacher) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 50,
      }}
    >
      <div
        className="card"
        style={{ maxWidth: 420, width: '100%', boxShadow: '0 10px 30px -10px #000' }}
      >
        <h3>Book Session with {teacher.userName || teacher.name}</h3>

        {ok ? (
          <>
            <div className="success">Session booked successfully!</div>
            <button onClick={onClose}>Close</button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flexcol">
            <label>
              Skill *
              <select
                value={skill}
                onChange={(e) => setSkill(Number(e.target.value))} 
                required
              >
                <option value="">Select a skill</option>
                {teachableSkills.map((s) => (
                  <option key={s.skillId} value={s.skillId}>
                    {s.skill} {s.level ? `(${s.level})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Duration (minutes) *
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              >
                <option value="">Select duration</option>
                {[30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </label>

            <label>
              Schedule Date & Time *
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Booking...' : 'Book Session'}
            </button>

            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

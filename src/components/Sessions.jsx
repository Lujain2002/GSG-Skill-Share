import React, { useState, useEffect } from 'react';

export default function Sessions() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);

 
  useEffect(() => {
    const storedUser = localStorage.getItem('user'); 
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);


  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5044/api/Sessions/sessions/user/${currentUser.id}`
        );
        if (!res.ok) throw new Error('Failed to load sessions');
        const data = await res.json();

        const mapped = data.map(s => ({
          id: s.sessionId,
          skill: s.skill,
          teacherName: s.teacher,
          learnerName: s.learner,
          durationMinutes: s.duration,
          status: (s.status || '').toLowerCase().trim(),
          scheduledAt: s.scheduledAt
        }));

        setSessions(mapped);
      } catch (err) {
        console.error('Error loading sessions:', err);
        alert('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [currentUser?.id]);

  // إلغاء الجلسة
  const cancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;

    setProcessingIds(prev => [...prev, sessionId]);
    try {
      const res = await fetch(
        `http://localhost:5044/api/Sessions/sessions/${sessionId}/cancel`,
        { method: 'POST' }
      );

      if (res.ok) {
        await fetchSessions(); 
        alert('Session cancelled successfully!');
        return;
      }

      const errorText = await res.text();
      throw new Error(errorText || `Cancel failed with status: ${res.status}`);
    } catch (err) {
      console.error('Cancel error:', err);
      alert(err.message || 'Could not cancel session. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== sessionId));
    }
  };

  if (!currentUser) return <div className="card">Loading user…</div>;
  if (loading) return <div className="card">Loading sessions…</div>;

  return (
    <div className="card">
      <h3>Sessions</h3>
      <table>
        <thead>
          <tr>
            <th>Skill</th>
            <th>Teacher</th>
            <th>Learner</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Scheduled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => {
            const current = currentUser.userName?.toLowerCase().trim();
            const isUserInvolved =
              s.teacherName?.toLowerCase().trim() === current ||
              s.learnerName?.toLowerCase().trim() === current;
            const isScheduled = s.status === 'scheduled';
            const isProcessing = processingIds.includes(s.id);

            return (
              <tr key={s.id}>
                <td>{s.skill}</td>
                <td>{s.teacherName}</td>
                <td>{s.learnerName}</td>
                <td>{s.durationMinutes}m</td>
                <td>
                  <span className={`status ${s.status}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : '—'}</td>
                <td style={{ display: 'flex', gap: '.3rem' }}>
                  {isScheduled && isUserInvolved ? (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => cancelSession(s.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Cancel'}
                    </button>
                  ) : (
                    <span className="muted">No actions</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sessions.length === 0 && <div className="muted">No sessions yet.</div>}
    </div>
  );
}

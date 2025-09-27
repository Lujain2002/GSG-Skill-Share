import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5044';

export default function Dashboard() {
  const [data, setData] = useState({ user: null, sessions: null, community: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    const userId = stored?.id;
    if (!userId) {
      setLoading(false);
      setError('No user found. Please log in again.');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const [userRes, sessionsRes, communityRes] = await Promise.all([
          fetch(`${API_BASE}/api/Dashboard/user/${userId}`),
          fetch(`${API_BASE}/api/Dashboard/sessions/summary/${userId}`),
          fetch(`${API_BASE}/api/Dashboard/community/summary`)
        ]);

        if (!userRes.ok) throw new Error('Failed to fetch user data');
        if (!sessionsRes.ok) throw new Error('Failed to fetch sessions data');
        if (!communityRes.ok) throw new Error('Failed to fetch community data');

        const [userData, sessionsData, communityData] = await Promise.all([
          userRes.json(),
          sessionsRes.json(),
          communityRes.json()
        ]);

        setData({
          user: userData,
          sessions: {
            teaching: sessionsData?.teachingSessions || 0,
            learning: sessionsData?.learningSessions || 0
          },
          community: { users: communityData?.userCount || 0 }
        });
      } catch (err) {
        console.error('Dashboard error', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const go = (tab) => {
    // Lightweight event-based navigation handled by App.jsx
    window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab } }));
  };

  if (loading) {
    return (
      <div className="card" aria-busy="true" aria-live="polite">
        <h3>Loading dashboard…</h3>
        <div className="muted">Fetching your stats and community summary.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>Dashboard</h3>
        <div className="error" role="alert">{error}</div>
        <div className="muted" style={{marginTop:'.5rem'}}>Try refreshing the page.</div>
      </div>
    );
  }

  const username = data.user?.userName || data.user?.username || data.user?.name || 'User';
  const points = data.user?.points ?? 0;
  const teaching = data.sessions?.teaching ?? 0;
  const learning = data.sessions?.learning ?? 0;
  const communityUsers = data.community?.users ?? 0;

  return (
    <div className="dashboard-grid" role="region" aria-label="Dashboard overview and key metrics">
      {/* Hero overview */}
      <div className="card dashboard-hero" role="region" aria-label="Overview" style={{padding:'1.1rem 1.25rem'}}>
        <h3 style={{marginTop:0}}>Welcome back, {username} 👋</h3>
        <div className="muted" style={{marginTop:'-.25rem'}}>Here’s a quick snapshot of your activity.</div>

        <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap', marginTop:'.8rem'}}>
          <button className="secondary" onClick={() => go('matches')}>Find Matches</button>
          <button className="secondary" onClick={() => go('sessions')}>View Sessions</button>
          <button className="secondary" onClick={() => go('skills')}>Edit Skills</button>
          <button onClick={() => go('points')}>Earn / Spend Points</button>
        </div>

      </div>

      {/* Metrics cards aligned in grid */}
      <div className="card metric" aria-label="Points">
        <div className="stat-label">Points</div>
        <div className="stat-value" title={`You have ${points} points`}>{points}</div>
        <div className="muted" style={{marginTop:'.25rem'}}>Teach to earn · Spend to book</div>
      </div>

      <div className="card metric" aria-label="Teaching sessions">
        <div className="stat-label">Teaching sessions</div>
        <div className="stat-value">{teaching}</div>
        <div className="muted" style={{marginTop:'.25rem'}}>Completed and scheduled</div>
      </div>

      <div className="card metric" aria-label="Learning sessions">
        <div className="stat-label">Learning sessions</div>
        <div className="stat-value">{learning}</div>
        <div className="muted" style={{marginTop:'.25rem'}}>Completed and scheduled</div>
      </div>

      <div className="card metric" aria-label="Community size">
        <div className="stat-label">Community</div>
        <div className="stat-value">{communityUsers}</div>
        <div className="muted" style={{marginTop:'.25rem'}}>Total users</div>
      </div>
    </div>
  );
}

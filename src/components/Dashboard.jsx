import React, { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Legend,
  LabelList
} from 'recharts';

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

  const username = data.user?.userName || data.user?.username || data.user?.name || 'User';
  const points = data.user?.points ?? 0;
  const teaching = data.sessions?.teaching ?? 0;
  const learning = data.sessions?.learning ?? 0;
  const communityUsers = data.community?.users ?? 0;

  const sessionMix = useMemo(() => {
    const entries = [
      { name: 'Teaching', value: teaching },
      { name: 'Learning', value: learning }
    ];
    const total = entries.reduce((sum, item) => sum + (item.value || 0), 0);
    return total === 0
      ? [{ name: 'No sessions yet', value: 1, isPlaceholder: true }]
      : entries;
  }, [teaching, learning]);

  const summaryBar = useMemo(() => {
    const core = [
      { name: 'Points', value: points },
      { name: 'Teaching', value: teaching },
      { name: 'Learning', value: learning }
    ];
    return core.map(item => ({ ...item, value: Math.max(item.value ?? 0, 0) }));
  }, [points, teaching, learning]);

  const palette = useMemo(() => ['#6366f1', '#22d3ee', '#f59e0b'], []);
  const totalSessions = useMemo(() => teaching + learning, [teaching, learning]);
  const sessionDetails = useMemo(() => {
    if (!totalSessions) return [];
    return [
      { label: 'Teaching', value: teaching, percent: Math.round((teaching / totalSessions) * 100) },
      { label: 'Learning', value: learning, percent: Math.round((learning / totalSessions) * 100) }
    ];
  }, [teaching, learning, totalSessions]);

  const barDetails = useMemo(() => (
    [
      { label: 'Points available', value: points, helper: 'Spend points when you book lessons.' },
      { label: 'Teaching sessions', value: teaching, helper: 'Completed or scheduled as a mentor.' },
      { label: 'Learning sessions', value: learning, helper: 'Completed or scheduled as a learner.' }
    ]
  ), [points, teaching, learning]);

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

      <div
        className="card chart-card"
        role="region"
        aria-label="Session distribution chart"
        style={{ minHeight: 320, display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <h4 style={{ margin: 0 }}>Session mix</h4>
          <div className="muted">A quick look at how you split learning vs teaching</div>
        </div>
        <div style={{ flex: 1, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sessionMix}
                dataKey="value"
                nameKey="name"
                innerRadius={sessionMix?.[0]?.isPlaceholder ? '60%' : '55%'}
                outerRadius="80%"
                paddingAngle={sessionMix?.[0]?.isPlaceholder ? 0 : 6}
              >
                {sessionMix.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.isPlaceholder ? 'rgba(148, 163, 184, 0.3)' : palette[index % palette.length]}
                    stroke={entry.isPlaceholder ? 'rgba(148, 163, 184, 0.6)' : palette[index % palette.length]}
                    strokeWidth={entry.isPlaceholder ? 1 : 2}
                  />
                ))}
                {!sessionMix?.[0]?.isPlaceholder && (
                  <LabelList
                    dataKey="value"
                    position="inside"
                    formatter={value => `${value}`}
                    fill="#f8fafc"
                    style={{ fontWeight: 600 }}
                  />
                )}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}`, name]}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(99,102,241,0.25)' }}
              />
              {!sessionMix?.[0]?.isPlaceholder && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value, entry) => (
                    <span style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.9rem' }}>{value}</span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
        {sessionMix?.[0]?.isPlaceholder ? (
          <div className="muted" style={{ textAlign: 'center' }}>
            Book your first session to populate this chart.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {sessionDetails.map(detail => (
              <div key={detail.label} style={{ minWidth: 140 }}>
                <div style={{ fontWeight: 700 }}>{detail.label}</div>
                <div className="muted">{detail.value} sessions · {detail.percent}%</div>
              </div>
            ))}
            <div style={{ minWidth: 140 }}>
              <div style={{ fontWeight: 700 }}>Total sessions</div>
              <div className="muted">{totalSessions}</div>
            </div>
          </div>
        )}
      </div>

      <div
        className="card chart-card"
        role="region"
        aria-label="Activity snapshot chart"
        style={{ minHeight: 320, display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <h4 style={{ margin: 0 }}>Activity snapshot</h4>
          <div className="muted">Points and sessions compared side-by-side</div>
        </div>
        <div style={{ flex: 1, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryBar} barSize={42}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary, #111827)' }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-primary, #111827)' }} />
              <Tooltip formatter={(value, name) => [`${value}`, name]} contentStyle={{ borderRadius: 12, border: '1px solid rgba(99,102,241,0.25)' }} />
              <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                {summaryBar.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
                <LabelList dataKey="value" position="top" formatter={value => `${value}`} fill="var(--text-primary, #0f172a)" style={{ fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {barDetails.map(detail => (
            <div key={detail.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontWeight: 700 }}>{detail.label}</span>
              <span className="muted">{detail.value} · {detail.helper}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

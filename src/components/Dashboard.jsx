import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { users } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [communitySize, setCommunitySize] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return;

    const fetchDashboardData = async () => {
      try {
        const userRes = await fetch(`http://localhost:5044/api/Dashboard/user/${user.id}`);
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const userData = await userRes.json();

        const sessionsRes = await fetch(`http://localhost:5044/api/Dashboard/sessions/summary/${user.id}`);
        if (!sessionsRes.ok) throw new Error('Failed to fetch sessions data');
        const sessionsData = await sessionsRes.json();

        const communityRes = await fetch(`http://localhost:5044/api/Dashboard/community/summary`);
        if (!communityRes.ok) throw new Error('Failed to fetch community data');
        const communityData = await communityRes.json();

        setCurrentUser({
          ...userData,
          teachingSessionsCount: sessionsData.teachingSessions || 0,
          learningSessionsCount: sessionsData.learningSessions || 0
        });
        setCommunitySize(communityData.userCount || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboardData();
  }, []);

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="card">
      <h3>Dashboard</h3>
      <div style={{ fontSize: '.8rem' }}>
        Welcome <strong>{currentUser.username || currentUser.name}</strong>. You have <strong>{currentUser.points || 0}</strong> points.<br/>
        Teaching sessions: {currentUser.teachingSessionsCount} · Learning sessions: {currentUser.learningSessionsCount}<br/>
        Community size: {communitySize} users
      </div>
      <div className="muted">Phase 1 demo: serverless prototype using localStorage.</div>
    </div>
  );
}

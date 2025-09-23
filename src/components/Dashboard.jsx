import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { currentUser, users } = useAuth();
  return (
    <div className="card">
      <h3>Dashboard</h3>
      <div style={{fontSize:'.8rem'}}>
        Welcome <strong>{currentUser.name}</strong>. You have <strong>{currentUser.points}</strong> points.<br/>
        Teaching sessions: {currentUser.history.taught} · Learning sessions: {currentUser.history.learned}<br/>
        Community size: {users.length} users
      </div>
      <div className="muted">Phase 1 demo: serverless prototype using localStorage.</div>
    </div>
  );
}

function Pill({ label, tone }) {
  return <span className={tone==='primary'? 'pill-chip primary':'pill-chip'}>{label}</span>;
}

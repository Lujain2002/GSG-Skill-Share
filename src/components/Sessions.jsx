import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const normalizeId = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const findUserByAnyId = (users, id) => {
  if (!Array.isArray(users)) return null;
  const needle = normalizeId(id);
  if (!needle) return null;
  return users.find(u => {
    const candidates = [u?.id, u?.userId, u?.appUserId];
    return candidates.some(candidate => normalizeId(candidate) === needle);
  }) || null;
};

const displayUser = (user) => {
  const name = user?.name || user?.fullName || user?.username || user?.userName;
  if (name) return name;
  const email = user?.email || user?.emailAddress;
  if (!email) return 'Peer';
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'Peer';
  const obfuscatedLocal = local.length <= 2 ? `${local[0] ?? ''}***` : `${local.slice(0, 2)}***`;
  return `${obfuscatedLocal}@${domain}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Sessions() {
  const ctx = useAuth() || {};
  const { sessions = [], currentUser = null, users = [], completeSession, cancelSession } = ctx;

  const viewerIdRaw = currentUser?.id || currentUser?.userId || currentUser?.appUserId || null;
  const viewerId = normalizeId(viewerIdRaw);

  if (!viewerId) {
    return (
      <div className="card">
        <h3>Sessions</h3>
        <div className="muted">Please log in to view your sessions.</div>
      </div>
    );
  }

  const mySessions = useMemo(() => {
    return (Array.isArray(sessions) ? sessions : [])
      .filter(session => {
        if (!session) return false;
        const teacherId = normalizeId(session.teacherId);
        const learnerId = normalizeId(session.learnerId);
        return teacherId === viewerId || learnerId === viewerId;
      })
      .sort((a, b) => {
        const aTime = new Date(a?.scheduledAt || a?.createdAt || 0).getTime();
        const bTime = new Date(b?.scheduledAt || b?.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [sessions, viewerId]);

  return (
    <div className="card">
      <h3>Sessions</h3>
      <table>
        <thead>
          <tr>
            <th>Skill</th>
            <th>Partner</th>
            <th>Your role</th>
            <th>Scheduled</th>
            <th>Duration</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {mySessions.map(session => {
            const teacherId = normalizeId(session.teacherId);
            const learnerId = normalizeId(session.learnerId);
            const isTeacher = teacherId === viewerId;
            const partnerId = isTeacher ? learnerId : teacherId;
            const partner = findUserByAnyId(users, partnerId);
            const partnerName = partner ? displayUser(partner) : 'Peer';

            return (
              <tr key={session.id}>
                <td>{session.skill || '—'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>{partnerName}</strong>
                    <span className="muted" style={{ fontSize: '.75rem' }}>
                      {isTeacher ? 'You are teaching this peer' : 'You are learning from this peer'}
                    </span>
                  </div>
                </td>
                <td>{isTeacher ? 'Teaching' : 'Learning'}</td>
                <td>{formatDate(session.scheduledAt || session.createdAt)}</td>
                <td>{session.durationMinutes ? `${session.durationMinutes}m` : '—'}</td>
                <td><span className={`status ${session.status}`}>{session.status}</span></td>
                <td style={{ display: 'flex', gap: '.3rem' }}>
                  {session.status === 'scheduled' && isTeacher && typeof completeSession === 'function' && (
                    <button type="button" onClick={() => completeSession(session.id)}>Complete</button>
                  )}
                  {session.status === 'scheduled' && typeof cancelSession === 'function' && (
                    <button type="button" className="secondary" onClick={() => cancelSession(session.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {mySessions.length === 0 && <div className="muted">No sessions yet.</div>}
    </div>
  );
}

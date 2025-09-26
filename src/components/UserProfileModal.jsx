import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BookSessionModal from './BookSessionModal';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  Box,
  Tooltip
} from '@mui/material';

const API_BASE = 'http://localhost:5044';

export default function UserProfileModal({ user, onClose }) {
  const open = Boolean(user);
  const userId = user?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const { currentUser, sessions = [] } = useAuth() || {};

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/Profiles/${userId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        const fullAvatar = data.avatarUrl ? `${API_BASE}${data.avatarUrl}` : null;
        if (alive) setProfile({ ...data, avatarUrl: fullAvatar });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('UserProfileModal load error', e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (open) load();
    return () => { alive = false; };
  }, [open, userId]);

  const displayName = user?.name || user?.userName || 'User';
  const email = user?.email;
  const canTeach = Array.isArray(user?.canTeach) ? user.canTeach : [];
  const wantLearn = Array.isArray(user?.wantLearn) ? user.wantLearn : [];

  // Pair restrictions preview (UI hints only; actual enforcement in bookSession)
  const pairInfo = useMemo(() => {
    if (!currentUser || !user) return { hasScheduled: false, cooldownDaysLeft: 0, daily: 0, weekly: 0, monthly: 0, completed: [], pair: [] };
    const pair = (sessions || []).filter(s =>
      (s.teacherId === user.id && s.learnerId === currentUser.id) ||
      (s.teacherId === currentUser.id && s.learnerId === user.id)
    );
    const hasScheduled = pair.some(s => s.status === 'scheduled');
    const now = new Date();
    const dayWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekWindow = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthWindow = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const daily = pair.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= dayWindow).length;
    const weekly = pair.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= weekWindow).length;
    const monthly = pair.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= monthWindow).length;
    // Mutual exchange cooldown (14d)
    const windowStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const completed = pair.filter(s => s.status === 'completed' && new Date(s.completedAt || s.createdAt || s.scheduledAt || now) >= windowStart);
    const aTaughtB = completed.some(s => s.teacherId === user.id && s.learnerId === currentUser.id);
    const bTaughtA = completed.some(s => s.teacherId === currentUser.id && s.learnerId === user.id);
    let cooldownDaysLeft = 0;
    if (aTaughtB && bTaughtA) {
      const last = completed.reduce((acc, s) => {
        const t = new Date(s.completedAt || s.updatedAt || s.scheduledAt || s.createdAt || now);
        return !acc || t > acc ? t : acc;
      }, null);
      const until = new Date((last || now).getTime() + 14 * 24 * 60 * 60 * 1000);
      const ms = until.getTime() - now.getTime();
      cooldownDaysLeft = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
    }
    return { hasScheduled, cooldownDaysLeft, daily, weekly, monthly, completed, pair };
  }, [sessions, currentUser, user]);

  // Determine button disable/label reason
  const availability = useMemo(() => {
    if (!currentUser || !user) return { disabled: true, label: 'Book Session' };
    if (currentUser.id === user.id) return { disabled: true, label: 'This is you' };
    // Points check for minimum 30m (cost 5)
    if ((currentUser.points ?? 0) < 5) return { disabled: true, label: 'Insufficient points' };
    // Pair limits
    if (pairInfo.hasScheduled) return { disabled: true, label: 'Already scheduled' };
    if (pairInfo.daily >= 2) return { disabled: true, label: 'Daily limit reached' };
    if (pairInfo.weekly >= 5) return { disabled: true, label: 'Weekly limit reached' };
    if (pairInfo.monthly >= 10) return { disabled: true, label: 'Monthly limit reached' };
    // Cooldown: allow only if there exists a new untaught skill from this teacher to me
    if (pairInfo.cooldownDaysLeft > 0) {
      const taughtSet = new Set(
        pairInfo.completed
          .filter(s => s.teacherId === user.id && s.learnerId === currentUser.id && s.skill)
          .map(s => String(s.skill).toLowerCase())
      );
      const availableNew = (canTeach || []).some(s => !taughtSet.has(String(s.skill || '').toLowerCase()));
      if (!availableNew) return { disabled: true, label: `Cooldown active (${pairInfo.cooldownDaysLeft}d)` };
    }
    return { disabled: false, label: 'Book Session' };
  }, [currentUser, user, canTeach, pairInfo]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth keepMounted>
  <DialogTitle>Profile</DialogTitle>
      <DialogContent dividers>
        {!user ? (
          <Typography variant="body2">No user selected.</Typography>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={profile?.avatarUrl || undefined} sx={{ width: 64, height: 64 }}>
                {(displayName || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Typography variant="h6">{displayName}</Typography>
                {email && (
                  <Typography variant="body2" color="text.secondary">{email}</Typography>
                )}
                {profile?.location && (
                  <Typography variant="body2">{profile.location}</Typography>
                )}
              </div>
            </Stack>

            {profile?.bio && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</Typography>
            )}

            {(profile?.teachingSessionsCount != null || profile?.learningSessionsCount != null) && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip size="small" label={`Teaching: ${profile?.teachingSessionsCount ?? 0}`} />
                <Chip size="small" label={`Learning: ${profile?.learningSessionsCount ?? 0}`} />
                <Chip size="small" label={`Can teach: ${profile?.canTeachSkillsCount ?? canTeach.length}`} />
                <Chip size="small" label={`Wants: ${profile?.wantToLearnSkillsCount ?? wantLearn.length}`} />
              </Box>
            )}

            <Divider />

            {canTeach.length > 0 && (
              <div>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Can teach</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {canTeach.map((s, i) => (
                    <Chip key={`${s.skill}-${i}`} size="small" label={`${s.skill}${s.category ? ` (${s.category})` : ''}`} />
                  ))}
                </Box>
              </div>
            )}

            {wantLearn.length > 0 && (
              <div>
                <Typography variant="subtitle2" sx={{ mb: 1, mt: canTeach.length ? 1 : 0 }}>Wants to learn</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {wantLearn.map((s, i) => (
                    <Chip key={`${s.skill}-${i}`} size="small" label={s.skill} />
                  ))}
                </Box>
              </div>
            )}

            {/* Booking actions */}
            <Divider sx={{ mt: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={availability.disabled && availability.label !== 'Book Session' ? availability.label : ''} arrow disableInteractive>
                <span>
                  <Button variant="contained" disabled={availability.disabled} onClick={() => setShowBook(true)}>
                    {availability.label}
                  </Button>
                </span>
              </Tooltip>
              {!availability.disabled && pairInfo.cooldownDaysLeft > 0 && (
                <Typography variant="caption" color="text.secondary">Cooldown: {pairInfo.cooldownDaysLeft}d (new untaught skills only)</Typography>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      {showBook && user && (
        <BookSessionModal teacher={user} onClose={() => setShowBook(false)} />
      )}
    </Dialog>
  );
}

import React, { useEffect, useState } from 'react';
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
  Box
} from '@mui/material';

const API_BASE = 'http://localhost:5044';

export default function UserProfileModal({ user, onClose }) {
  const open = Boolean(user);
  const userId = user?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

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
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

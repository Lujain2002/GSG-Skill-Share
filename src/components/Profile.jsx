import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Stack, Avatar, Paper, Typography } from '@mui/material';

const API_BASE = 'http://localhost:5044';  

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('');
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.id;
    if (!userId) return;

    fetch(`${API_BASE}/api/Profiles/${userId}`)
      .then(res => res.json())
      .then(data => {
        const fullAvatar = data.avatarUrl
          ? `${API_BASE}${data.avatarUrl}`
          : null;
        setUser({ ...data, avatarUrl: fullAvatar });
        setBio(data.bio || '');
        setLocation(data.location || '');
        setAvatarPreview(fullAvatar);
      })
      .catch(err => console.error('Profile fetch error', err));
  }, []);

  if (!user) return <Typography>Loading profile...</Typography>;

  const dirty =
    bio !== (user.bio || '') ||
    location !== (user.location || '') ||
    avatarFile !== null ||
    (avatarPreview === null && user.avatarUrl);

  const save = async () => {
    setSaving(true);
    const userId = user.id;

    try {
      await fetch(`${API_BASE}/api/Profiles/updateInfo/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          bio: bio.trim(),
          location: location.trim()
        })
      });

      if (avatarFile) {
        const fd = new FormData();
        fd.append('Avatar', avatarFile);
        await fetch(`${API_BASE}/api/Profiles/updateAvatar/${userId}`, {
          method: 'POST',
          body: fd
        });
      } else if (!avatarPreview && user.avatarUrl) {
        await fetch(`${API_BASE}/api/Profiles/${userId}/avatar`, {
          method: 'DELETE'
        });
      }

      const updated = await fetch(`${API_BASE}/api/Profiles/${userId}`).then(r => r.json());
      const fullAvatar = updated.avatarUrl ? `${API_BASE}${updated.avatarUrl}` : null;

      setUser({ ...updated, avatarUrl: fullAvatar });
      setBio(updated.bio || '');
      setLocation(updated.location || '');
      setAvatarPreview(fullAvatar);
      setAvatarFile(null);
    } catch (err) {
      console.error('Profile save error', err);
    } finally {
      setSaving(false);
    }
  };

  const onSelectAvatar = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Not an image file');
      return;
    }
    if (file.size > 1_500_000) {
      setAvatarError('Max 1.5 MB');
      return;
    }
    setAvatarError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));    
  };

  return (
    <div className="card" style={{ padding: '1.25rem 1.25rem 1.75rem' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Avatar
          sx={{ width: 80, height: 80, fontSize: 28, bgcolor: '#2563eb' }}
          src={avatarPreview || undefined}
        >
          {!avatarPreview && initials(user.userName)}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {user.userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </div>
      </Stack>

      <Stack spacing={2} sx={{ maxWidth: 600 }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onSelectAvatar}
        />
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => fileRef.current?.click()}>
            Change Avatar
          </Button>
          {avatarPreview && (
            <Button
              size="small"
              variant="text"
              onClick={() => {
                setAvatarPreview(null);
                setAvatarFile(null);
              }}
            >
              Remove
            </Button>
          )}
        </Stack>
        {avatarError && (
          <Typography variant="caption" color="error">
            {avatarError}
          </Typography>
        )}

        <TextField
          label="Location"
          size="small"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="City, Country"
        />
        <TextField
          label="Bio"
          size="small"
          value={bio}
          onChange={e => setBio(e.target.value)}
          multiline
          minRows={3}
          placeholder="Tell others what you like to teach or learn..."
        />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" disabled={!dirty || saving} onClick={save}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
          {dirty && !saving && (
            <Button
              variant="text"
              onClick={() => {
                setBio(user.bio || '');
                setLocation(user.location || '');
                setAvatarPreview(user.avatarUrl || null);
                setAvatarFile(null);
              }}
            >
              Reset
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Stats
        </Typography>
        <Typography variant="caption" display="block">
          Teaching sessions: {user.teachingSessionsCount}
        </Typography>
        <Typography variant="caption" display="block">
          Learning sessions: {user.learningSessionsCount}
        </Typography>
        <Typography variant="caption" display="block">
          Can teach: {user.canTeachSkillsCount} skills · Want to learn: {user.wantToLearnSkillsCount}{' '}
          skills
        </Typography>
      </Paper>
    </div>
  );
}

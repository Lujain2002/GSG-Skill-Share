import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Stack, Avatar, Paper, Typography } from '@mui/material';

function initials(name='') { return name.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join(''); }

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const [bio,setBio] = useState(currentUser.profile?.bio || '');
  const [location,setLocation] = useState(currentUser.profile?.location || '');
  const [saving,setSaving] = useState(false);
  const [avatarPreview,setAvatarPreview] = useState(currentUser.profile?.avatarUrl || null);
  const [avatarError,setAvatarError] = useState('');
  const fileRef = useRef();
  const dirty = bio !== (currentUser.profile?.bio||'') || location !== (currentUser.profile?.location||'') || avatarPreview !== (currentUser.profile?.avatarUrl||null);
  const save = () => {
    setSaving(true);
    updateProfile(currentUser.id, { bio: bio.trim(), location: location.trim(), avatarUrl: avatarPreview });
    setTimeout(()=> setSaving(false), 350);
  };

  const onSelectAvatar = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(!file.type.startsWith('image/')) { setAvatarError('Not an image file'); return; }
    if(file.size > 1_500_000) { setAvatarError('Max 1.5MB'); return; }
    setAvatarError('');
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        // cover crop center
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide)/2;
        const sy = (img.height - minSide)/2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        setAvatarPreview(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFile = () => fileRef.current?.click();
  const removeAvatar = () => { setAvatarPreview(null); };
  return (
    <div className="card" style={{padding:'1.25rem 1.25rem 1.75rem'}}>
      <Stack direction={{xs:'column', sm:'row'}} spacing={3} alignItems={{xs:'flex-start', sm:'center'}} sx={{mb:2}}>
        <Avatar sx={{ width:80, height:80, fontSize:28, bgcolor: currentUser.profile?.avatarColor || '#2563eb' }} src={avatarPreview || undefined}>{!avatarPreview && initials(currentUser.name)}</Avatar>
        <div style={{flex:1}}>
          <Typography variant="h6" sx={{mb:.5}}>{currentUser.name}</Typography>
          <Typography variant="body2" color="text.secondary">{currentUser.email}</Typography>
          <Typography variant="caption" color="primary" sx={{display:'block',mt:.5}}>Points: {currentUser.points}</Typography>
        </div>
      </Stack>
      <Stack spacing={2} sx={{maxWidth:600}}>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onSelectAvatar} />
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={triggerFile}>Change Avatar</Button>
          {avatarPreview && <Button size="small" variant="text" onClick={removeAvatar}>Remove</Button>}
        </Stack>
        {avatarError && <Typography variant="caption" color="error">{avatarError}</Typography>}
        <TextField label="Location" size="small" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, Country" />
        <TextField label="Bio" size="small" value={bio} onChange={e=>setBio(e.target.value)} multiline minRows={3} placeholder="Tell others what you like to teach or learn..." />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" disabled={!dirty || saving} onClick={save}>{saving? 'Saving...' : 'Save Profile'}</Button>
          {dirty && !saving && <Button variant="text" onClick={()=>{ setBio(currentUser.profile?.bio||''); setLocation(currentUser.profile?.location||''); setAvatarPreview(currentUser.profile?.avatarUrl||null); }}>Reset</Button>}
        </Stack>
      </Stack>
      <Paper variant="outlined" sx={{mt:3,p:2, background:'rgba(255,255,255,0.02)'}}>
        <Typography variant="subtitle2" sx={{mb:1}}>Stats</Typography>
        <Typography variant="caption" sx={{display:'block'}}>Teaching sessions: {currentUser.history.taught}</Typography>
        <Typography variant="caption" sx={{display:'block'}}>Learning sessions: {currentUser.history.learned}</Typography>
        <Typography variant="caption" sx={{display:'block'}}>Can teach: {currentUser.canTeach.length} skills · Want to learn: {currentUser.wantLearn.length} skills</Typography>
      </Paper>
    </div>
  );
}

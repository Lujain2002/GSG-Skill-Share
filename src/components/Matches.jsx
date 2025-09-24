import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../utils/matching';
import { SKILL_CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories';
import { Box, TextField, Select, MenuItem, FormControlLabel, Checkbox, InputAdornment, ToggleButton, ToggleButtonGroup, Avatar, Chip, Tooltip, IconButton, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import UserProfileModal from './UserProfileModal';
import BookSessionModal from './BookSessionModal';

const COOLDOWN_DAYS = 14;

export default function Matches({ onBook }) {
  const { users = [], currentUser, sessions = [] } = useAuth() || {};
  const [category, setCategory] = useState('All');
  const [hideExchanged, setHideExchanged] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('score'); // score | name
  const [viewUser, setViewUser] = useState(null);
  const [bookUser, setBookUser] = useState(null);

  const matchesRaw = getMatches(currentUser, users) || [];

  // Build directional map of last completed session dates within cooldown window
  const dirMap = useMemo(() => {
    const map = new Map(); // key: `${teacherId}|${learnerId}` -> lastDate
    if (!currentUser) return map;
    const now = new Date();
    const windowStart = new Date(now.getTime() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    const completed = (sessions || []).filter(
      s => s.status === 'completed' && new Date(s.completedAt || s.createdAt || s.scheduledAt || now) >= windowStart
    );
    for (const s of completed) {
      const key = `${s.teacherId}|${s.learnerId}`;
      const when = new Date(s.completedAt || s.createdAt || s.scheduledAt || now);
      const prev = map.get(key);
      if (!prev || when > prev) map.set(key, when);
    }
    return map;
  }, [sessions, currentUser]);

  const getExchangeInfo = (otherUserId) => {
    if (!currentUser) return { exchanged: false };
    const ab = dirMap.get(`${currentUser.id}|${otherUserId}`);
    const ba = dirMap.get(`${otherUserId}|${currentUser.id}`);
    if (ab && ba) {
      const last = ab > ba ? ab : ba;
      const daysSince = Math.floor((Date.now() - last.getTime()) / (24 * 60 * 60 * 1000));
      const daysLeft = Math.max(0, COOLDOWN_DAYS - daysSince);
      return { exchanged: true, daysLeft };
    }
    return { exchanged: false };
  };

  // Base list after category + search (before hiding exchanged)
  const filteredCandidates = useMemo(() => {
    if (!currentUser || !Array.isArray(matchesRaw)) return [];
    let list = [...matchesRaw];
    if (category !== 'All') {
      list = list.filter(m => m.user.canTeach?.some(s => s.category === category));
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(m => {
        const name = (m.user.name || m.user.userName || '').toLowerCase();
        const teaches = (m.user.canTeach || []).map(s => `${s.skill} ${s.category || ''}`.toLowerCase()).join(' ');
        const wants = (m.user.wantLearn || []).map(s => s.skill.toLowerCase()).join(' ');
        return name.includes(needle) || teaches.includes(needle) || wants.includes(needle);
      });
    }
    return list;
  }, [matchesRaw, category, q, currentUser]);

  const hiddenExchangedCount = useMemo(() => {
    return filteredCandidates.filter(m => getExchangeInfo(m.user.id).exchanged).length;
  }, [filteredCandidates, dirMap, currentUser]);

  const matches = useMemo(() => {
    let list = [...filteredCandidates];
    if (hideExchanged) {
      list = list.filter(m => !getExchangeInfo(m.user.id).exchanged);
    }
    list.sort((a, b) => {
      if (sort === 'name') {
        const an = (a.user.name || a.user.userName || '').toLowerCase();
        const bn = (b.user.name || b.user.userName || '').toLowerCase();
        return an.localeCompare(bn);
      }
      return (b.score || 0) - (a.score || 0);
    });
    return list;
  }, [filteredCandidates, hideExchanged, sort, dirMap]);

  if (!currentUser) {
    return (
      <div className="card">
        <h3>Matches</h3>
        <div className="muted">Please log in to see matches.</div>
      </div>
    );
  }

  return (
    <div className="card" role="region" aria-label="Matches">
      <h3>Matches</h3>

      {/* Filters */}
      <Box sx={{display:'flex', gap:1, flexWrap:'wrap', alignItems:'center', mb:1}}>
        <TextField
          size="small"
          placeholder="Search name or skill"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small"/>
              </InputAdornment>
            )
          }}
        />
        <Select size="small" value={category} onChange={(e)=>setCategory(e.target.value)} displayEmpty>
          <MenuItem value="All"><FilterAltIcon fontSize="small" style={{marginRight:6}}/> All Categories</MenuItem>
          {SKILL_CATEGORIES.concat([DEFAULT_CATEGORY]).map(c => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
        <FormControlLabel
          control={<Checkbox size="small" checked={hideExchanged} onChange={(e)=>setHideExchanged(e.target.checked)} />}
          label={
            <Box sx={{display:'inline-flex', alignItems:'center', gap:.5}}>
              <Typography variant="body2">
                Hide exchanged pairs{hiddenExchangedCount ? ` (${hiddenExchangedCount})` : ''}
              </Typography>
              <Tooltip title={`Hides pairs you've exchanged with in the last ${COOLDOWN_DAYS} days`}>
                <InfoOutlinedIcon fontSize="small" style={{opacity:.7}} />
              </Tooltip>
            </Box>
          }
        />
        <ToggleButtonGroup size="small" value={sort} exclusive onChange={(_e, v)=>{ if(v) setSort(v); }}>
          <ToggleButton value="score" aria-label="Sort by score"><SortIcon fontSize="small" style={{marginRight:6}}/>Score</ToggleButton>
          <ToggleButton value="name" aria-label="Sort by name">Name</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {matches.length === 0 && (
        <div className="muted">No matches yet. Try adding more skills or widening your search.</div>
      )}

      {/* Results */}
      <div className="panels" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>
        {matches.map(m => {
          const { exchanged, daysLeft } = getExchangeInfo(m.user.id);
          const name = m.user.name || m.user.userName || 'User';
          const initials = String(name).split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join('');
          const teaches = m.user.canTeach || [];
          const wants = m.user.wantLearn || [];

          // Availability logic for booking
          const isSelf = currentUser?.id === m.user.id;
          const pair = (sessions || []).filter(s =>
            (s.teacherId === m.user.id && s.learnerId === currentUser?.id) ||
            (s.teacherId === currentUser?.id && s.learnerId === m.user.id)
          );
          const hasScheduled = pair.some(s => s.status === 'scheduled');
          const now = new Date();
          const dayWindow = new Date(now.getTime() - 24*60*60*1000);
          const weekWindow = new Date(now.getTime() - 7*24*60*60*1000);
          const monthWindow = new Date(now.getTime() - 30*24*60*60*1000);
          const daily = pair.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= dayWindow).length;
          const weekly = pair.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= weekWindow).length;
          const monthly = pair.filter(s => new Date(s.createdAt || s.scheduledAt || now) >= monthWindow).length;
          const cooldownDaysLeft = exchanged ? daysLeft : 0;
          let disabled = false;
          let label = 'Book Session';
          if (isSelf) { disabled = true; label = 'This is you'; }
          else if ((currentUser?.points ?? 0) < 5) { disabled = true; label = 'Insufficient points'; }
          else if (hasScheduled) { disabled = true; label = 'Already scheduled'; }
          else if (daily >= 2) { disabled = true; label = 'Daily limit reached'; }
          else if (weekly >= 5) { disabled = true; label = 'Weekly limit reached'; }
          else if (monthly >= 10) { disabled = true; label = 'Monthly limit reached'; }
          else if (cooldownDaysLeft > 0) {
            const taughtSet = new Set(
              pair
                .filter(s => s.status === 'completed' && s.teacherId === m.user.id && s.learnerId === currentUser?.id && s.skill)
                .map(s => String(s.skill).toLowerCase())
            );
            const availableNew = (teaches || []).some(s => !taughtSet.has(String(s.skill || '').toLowerCase()));
            if (!availableNew) { disabled = true; label = `Cooldown active (${cooldownDaysLeft}d)`; }
          }

          return (
            <div key={m.user.id} className={`card match-card ${exchanged ? 'exchanged' : ''}`} style={{position:'relative'}}>
              <Box sx={{display:'flex', alignItems:'center', gap:1}}>
                <Avatar sx={{width:34, height:34}}><PersonIcon fontSize="small"/></Avatar>
                <div style={{flex:1}}>
                  <strong>{name}</strong>
                  <div className="muted" style={{fontSize:'.7rem'}}>Score: {m.score}</div>
                </div>
                {exchanged && (
                  <span className="badge" style={{position:'absolute', top:8, right:8, fontSize:'.65rem', background:'#334155', padding:'.2rem .4rem', borderRadius:4}}>
                    Exchanged{typeof daysLeft==='number' ? ` • ${daysLeft}d left` : ''}
                  </span>
                )}
              </Box>

              {teaches.length > 0 && (
                <div style={{marginTop:'.25rem'}}>
                  <div className="muted" style={{fontSize:'.7rem', marginBottom:'.25rem'}}>Teaches</div>
                  <div className="skills-list">
                    {teaches.slice(0,5).map((s, idx) => (
                      <span key={idx} className="chip">
                        {s.skill}{s.category ? ` (${s.category.split(' ')[0]})` : ''}
                      </span>
                    ))}
                    {teaches.length > 5 && (
                      <span className="chip">+{teaches.length - 5} more</span>
                    )}
                  </div>
                </div>
              )}

              {wants.length > 0 && (
                <div>
                  <div className="muted" style={{fontSize:'.7rem', margin:'.35rem 0 .25rem'}}>Wants to learn</div>
                  <div className="skills-list">
                    {wants.slice(0,4).map((s, idx) => (
                      <span key={idx} className="chip">{s.skill}</span>
                    ))}
                    {wants.length > 4 && (
                      <span className="chip">+{wants.length - 4} more</span>
                    )}
                  </div>
                </div>
              )}

              <Box sx={{display:'flex', gap:.75, mt:.75}}>
                <Tooltip title={disabled && label !== 'Book Session' ? label : ''} arrow disableInteractive>
                  <span>
                    <Button size="small" variant="contained" startIcon={<BookOnlineIcon />} onClick={()=> setBookUser(m.user)} disabled={disabled}>
                      {label}
                    </Button>
                  </span>
                </Tooltip>
                <Button size="small" variant="text" onClick={()=>setViewUser(m.user)}>View Profile</Button>
              </Box>
            </div>
          );
        })}
      </div>
      <UserProfileModal user={viewUser} onClose={()=>setViewUser(null)} />
      {bookUser && (
        <BookSessionModal teacher={bookUser} onClose={()=>setBookUser(null)} />
      )}
    </div>
  );
}

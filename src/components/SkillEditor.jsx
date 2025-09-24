import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Typography,
  Box
} from '@mui/material';
import { validateSkill } from '../utils/validation';

const API_BASE = 'http://localhost:5044';
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']; // enum : 0,1,2

function SkillList({ title, list, onRemove }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {list.length === 0 &&
          <Typography variant="caption" color="text.secondary">None yet</Typography>}
        {list.map(s => (
          <Chip
            key={s.id || s.skill + s.level}
            label={`${s.skill}${s.level ? ' · ' + s.level : ''}`}
            onDelete={() => onRemove(s)}
            size="small"
            color={title.includes('Teach') ? 'primary' : 'default'}
            variant={title.includes('Teach') ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default function SkillEditor() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [teach, setTeach] = useState([]);
  const [learn, setLearn] = useState([]);
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [mode, setMode] = useState('teach');
  const [categoryId, setCategoryId] = useState('');
  const [skillError, setSkillError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/Categories/`)
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`${API_BASE}/api/UserSkills/${currentUser.id}`)
      .then(r => r.json())
      .then(data => {
        const teachList = [];
        const learnList = [];
        data.forEach(d => {
          const entry = {
            id: d.userSkillId || d.id,
            skill: d.skillName,
            level: LEVELS[d.level] || 'Any',
            categoryId: d.categoryId
          };
          if (d.type === 0) teachList.push(entry);
          else learnList.push(entry);
        });
        // Deduplicate by (skill + categoryId + type)
        const key = (x, t) => `${(x.skill||'').toLowerCase()}|${x.categoryId}|${t}`;
        const tMap = new Map();
        teachList.forEach(x => { const k = key(x, 0); if (!tMap.has(k)) tMap.set(k, x); });
        const lMap = new Map();
        learnList.forEach(x => { const k = key(x, 1); if (!lMap.has(k)) lMap.set(k, x); });
        setTeach(Array.from(tMap.values()));
        setLearn(Array.from(lMap.values()));
      })
      .catch(console.error);
  }, [currentUser]);

  const add = () => {
    const err = validateSkill(skill.trim());
    setSkillError(err);
    if (err || !categoryId) return;

    const entry = {
      skill: skill.trim(),
      level: mode === 'teach' ? level : 'Any',
      categoryId
    };

    if (mode === 'teach') {
      const exists = teach.some(s => s.skill.toLowerCase() === entry.skill.toLowerCase() && String(s.categoryId) === String(entry.categoryId));
      if (!exists) setTeach([...teach, entry]);
    } else {
      const exists = learn.some(s => s.skill.toLowerCase() === entry.skill.toLowerCase() && String(s.categoryId) === String(entry.categoryId));
      if (!exists) setLearn([...learn, entry]);
    }

    setSkill('');
    setSkillError('');
  };

  const removeTeach = (s) => {
    setTeach(teach.filter(x => x !== s));
    if (s.id) fetch(`${API_BASE}/api/UserSkills/${s.id}`, { method: 'DELETE' });
  };

  const removeLearn = (s) => {
    setLearn(learn.filter(x => x !== s));
    if (s.id) fetch(`${API_BASE}/api/UserSkills/${s.id}`, { method: 'DELETE' });
  };

  const save = async () => {
    const newSkills = [...teach.map(s => ({ ...s, type: 0 })),
                       ...learn.map(s => ({ ...s, type: 1 }))];
    // Merge client-side duplicates before sending
    const norm = (x) => `${x.skill.trim().toLowerCase()}|${x.categoryId}|${x.type}`;
    const merged = new Map();
    for (const s of newSkills) { if (s.skill) merged.set(norm(s), s); }
    const uniqueList = Array.from(merged.values());

    for (const s of uniqueList) {
      if (!s.id) {
        const res = await fetch(`${API_BASE}/api/UserSkills/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            categoryId: s.categoryId,
            skillName: s.skill,
            type: s.type, // 0 = CanTeach, 1 = WantToLearn
            level: s.type === 0 ? LEVELS.indexOf(s.level) : 0
          })
        });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error('Failed to add skill', s);
        }
      }
    }
    // Refetch to capture server IDs and avoid local duplication
    try {
      const r = await fetch(`${API_BASE}/api/UserSkills/${currentUser.id}`);
      const data = await r.json();
      const teachList = [];
      const learnList = [];
      data.forEach(d => {
        const entry = {
          id: d.userSkillId || d.id,
          skill: d.skillName,
          level: LEVELS[d.level] || 'Any',
          categoryId: d.categoryId
        };
        if (d.type === 0) teachList.push(entry); else learnList.push(entry);
      });
      setTeach(teachList);
      setLearn(learnList);
    } catch {}
  };

  return (
    <div className="card" style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Skills</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button size="small" variant={mode === 'teach' ? 'contained' : 'outlined'}
                onClick={() => setMode('teach')}>Teach</Button>
        <Button size="small" variant={mode === 'learn' ? 'contained' : 'outlined'}
                onClick={() => setMode('learn')}>Learn</Button>
      </Stack>

      <Box component="form" onSubmit={e => { e.preventDefault(); add(); }}
           sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 2 }}>
        <TextField
          size="small"
          label={mode === 'teach' ? 'Skill you can teach' : 'Skill you want to learn'}
          value={skill}
          onChange={e => setSkill(e.target.value)}
          error={!!skillError}
          helperText={skillError || ' '}
          sx={{ flex: '1 1 180px' }}
        />

        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={e => setCategoryId(e.target.value)}
          >
            {categories.map(c => (
              <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {mode === 'teach' && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={level}
              label="Level"
              onChange={e => setLevel(e.target.value)}
            >
              {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </FormControl>
        )}

        <Button type="submit" variant="contained" size="small">Add</Button>
        <Button type="button" variant="outlined" size="small" onClick={save}>Save</Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
        <Box sx={{ flex: 1 }}>
          <SkillList title="Can Teach" list={teach} onRemove={removeTeach} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SkillList title="Want to Learn" list={learn} onRemove={removeLearn} />
        </Box>
      </Stack>
    </div>
  );
}

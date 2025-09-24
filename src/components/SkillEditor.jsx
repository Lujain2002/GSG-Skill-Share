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
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { validateSkill } from '../utils/validation';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CategoryIcon from '@mui/icons-material/Category';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const API_BASE = 'http://localhost:5044';
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']; // enum : 0,1,2

function SkillList({ title, list, onRemove, categories }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {list.length === 0 &&
          <Typography variant="caption" color="text.secondary">None yet</Typography>}
        {list.map(s => (
          <Chip
            key={s.id || s.skill + s.level}
            label={`${s.skill}${s.level ? ' · ' + s.level : ''}${s.categoryId ? ' · ' + (categories.find(c=>String(c.categoryId)===String(s.categoryId))?.name || '') : ''}`}
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
  const [saving, setSaving] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

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
    setSaving(true);
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
      setSavedOpen(true);
    } catch {}
    finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
      <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between', mb: 2}}>
        <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1 }}>
          Skills
          <Typography component="span" variant="caption" color="text.secondary" sx={{ml:1}}>
            Teach: {teach.length} · Learn: {learn.length}
          </Typography>
        </Typography>
        <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_e,v)=>{ if(v) setMode(v); }}>
          <ToggleButton value="teach" aria-label="Teach"><SchoolIcon fontSize="small"/> Teach</ToggleButton>
          <ToggleButton value="learn" aria-label="Learn"><MenuBookIcon fontSize="small"/> Learn</ToggleButton>
        </ToggleButtonGroup>
      </Box>

   <Box id="skills-form" component="form" onSubmit={e => { e.preventDefault(); add(); }}
     sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 2 }}>
        <TextField
          size="small"
          label={mode === 'teach' ? 'Skill you can teach' : 'Skill you want to learn'}
          value={skill}
          onChange={e => setSkill(e.target.value)}
          error={!!skillError}
          helperText={skillError || ' '}
          sx={{ flex: '1 1 240px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {mode === 'teach' ? <SchoolIcon fontSize="small"/> : <MenuBookIcon fontSize="small"/>}
              </InputAdornment>
            )
          }}
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

        {/* Actions moved to footer bar below */}
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
        <Box sx={{ flex: 1 }}>
          <SkillList title="Can Teach" list={teach} onRemove={removeTeach} categories={categories} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SkillList title="Want to Learn" list={learn} onRemove={removeLearn} categories={categories} />
        </Box>
      </Stack>

      {/* Footer actions */}
      <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1, mt:2, pt:1, borderTop:'1px solid #232b36' }}>
        <Tooltip title="Add to list">
          <Button form="skills-form" type="submit" variant="contained" size="small" startIcon={<AddIcon />}>Add</Button>
        </Tooltip>
        <Tooltip title="Save changes to your skills">
          <Button type="button" color="success" variant="contained" size="small" startIcon={<SaveIcon />} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Tooltip>
      </Box>

      <Snackbar open={savedOpen} autoHideDuration={2000} onClose={() => setSavedOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }} onClose={() => setSavedOpen(false)}>
          Skills saved
        </Alert>
      </Snackbar>
    </div>
  );
}

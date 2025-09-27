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
  Tooltip,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide
} from '@mui/material';
import { validateSkill } from '../utils/validation';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CategoryIcon from '@mui/icons-material/Category';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const API_BASE = 'http://localhost:5044';
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']; // enum : 0,1,2

function SkillList({ title, list, onRemove, onEdit, categories, type }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {list.length === 0 &&
          <Typography variant="caption" color="text.secondary">None yet</Typography>}
        {list.map((s, index) => (
          <Chip
            key={s.id || s.skill + s.level}
            label={`${s.skill}${s.level ? ' · ' + s.level : ''}${s.categoryId ? ' · ' + (categories.find(c=>String(c.categoryId)===String(s.categoryId))?.name || '') : ''}`}
            onDelete={() => onRemove(s)}
            onClick={() => onEdit(s, index, type)}
            size="small"
            color={title.includes('Teach') ? 'primary' : 'default'}
            variant={title.includes('Teach') ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
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
  const [categoryError, setCategoryError] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editOpen, setEditOpen] = useState(false);
  const [editInfo, setEditInfo] = useState(null);
  const [editMode, setEditMode] = useState('teach');
  const [editSkill, setEditSkill] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editLevel, setEditLevel] = useState('Beginner');
  const [editError, setEditError] = useState('');
  const [editCategoryError, setEditCategoryError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

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
    const trimmed = skill.trim();
    const err = validateSkill(trimmed);
    setSkillError(err);
    if (err) return;
    if (!categoryId) {
      setCategoryError('Category required');
      return;
    }

    const entry = {
      skill: trimmed,
      level: mode === 'teach' ? level : 'Any',
      categoryId
    };

    if (mode === 'teach') {
      const exists = teach.some(s => s.skill.trim().toLowerCase() === entry.skill.toLowerCase() && String(s.categoryId) === String(entry.categoryId));
      if (exists) {
        setSkillError('Already added to Teach in this category');
        return;
      }
      setTeach([...teach, entry]);
    } else {
      const exists = learn.some(s => s.skill.trim().toLowerCase() === entry.skill.toLowerCase() && String(s.categoryId) === String(entry.categoryId));
      if (exists) {
        setSkillError('Already added to Learn in this category');
        return;
      }
      setLearn([...learn, entry]);
    }

    setSkill('');
    setSkillError('');
    setCategoryError('');
  };

  const removeTeach = (s) => {
    setTeach(teach.filter(x => x !== s));
    if (s.id) fetch(`${API_BASE}/api/UserSkills/${s.id}`, { method: 'DELETE' });
  };

  const removeLearn = (s) => {
    setLearn(learn.filter(x => x !== s));
    if (s.id) fetch(`${API_BASE}/api/UserSkills/${s.id}`, { method: 'DELETE' });
  };

  const openEditModal = (skill, index, type) => {
    setEditInfo({ index, type, id: skill.id, original: skill });
    setEditMode(type);
    setEditSkill(skill.skill);
    setEditCategoryId(skill.categoryId || '');
    setEditLevel(type === 'teach' ? (LEVELS.includes(skill.level) ? skill.level : 'Beginner') : 'Any');
    setEditError('');
    setEditCategoryError('');
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditInfo(null);
    setEditError('');
    setEditCategoryError('');
    setEditSaving(false);
  };

  const updateLocalSkill = (updatedSkill) => {
    if (!editInfo) return;
    if (editInfo.type === 'teach') {
      setTeach(prev => prev.map((item, idx) => (
        idx === editInfo.index ? { ...item, ...updatedSkill } : item
      )));
    } else {
      setLearn(prev => prev.map((item, idx) => (
        idx === editInfo.index ? { ...item, ...updatedSkill } : item
      )));
    }
  };

  const handleEditSave = async () => {
    if (!editInfo) return;
    const trimmed = editSkill.trim();
    const validationError = validateSkill(trimmed);
    setEditError(validationError);
    if (validationError) return;
    if (!editCategoryId) {
      setEditCategoryError('Category required');
      return;
    }

    const typeFlag = editMode === 'teach' ? 0 : 1;
    const levelFlag = editMode === 'teach' ? LEVELS.indexOf(editLevel) : 0;
    setEditSaving(true);

    const applyAndNotify = (updatedData) => {
      updateLocalSkill(updatedData);
      setSnackbar({ open: true, message: 'Skill updated', severity: 'success' });
      handleEditClose();
    };

    try {
      if (editInfo.id) {
        const res = await fetch(`${API_BASE}/api/UserSkills/${editInfo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            categoryId: editCategoryId,
            skillName: trimmed,
            type: typeFlag,
            level: levelFlag
          })
        });
        if (!res.ok) {
          throw new Error('Failed to update skill');
        }
        const updated = await res.json();
        applyAndNotify({
          id: updated.userSkillId,
          skill: updated.skillName,
          level: editMode === 'teach' ? (LEVELS[updated.level] || editLevel) : 'Any',
          categoryId: updated.categoryId
        });
      } else {
        applyAndNotify({
          skill: trimmed,
          level: editMode === 'teach' ? editLevel : 'Any',
          categoryId: editCategoryId
        });
      }
    } catch (err) {
      console.error('Edit skill failed', err);
      setSnackbar({ open: true, message: err.message || 'Unable to update skill', severity: 'error' });
      setEditSaving(false);
    }
  };

  const handleSnackbarClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
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
      setSnackbar({ open: true, message: 'Skills saved', severity: 'success' });
    } catch (err) {
      console.error('Failed to refresh skills', err);
      setSnackbar({ open: true, message: 'Skills saved locally, but refresh failed', severity: 'warning' });
    }
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
          onChange={e => {
            const v = e.target.value;
            setSkill(v);
            setSkillError(validateSkill(v.trim()));
          }}
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

        <FormControl size="small" sx={{ minWidth: 170 }} error={!!categoryError}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={e => { setCategoryId(e.target.value); setCategoryError(''); }}
          >
            {categories.map(c => (
              <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
            ))}
          </Select>
          {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
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
          <SkillList title="Can Teach" list={teach} onRemove={removeTeach} onEdit={openEditModal} categories={categories} type="teach" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SkillList title="Want to Learn" list={learn} onRemove={removeLearn} onEdit={openEditModal} categories={categories} type="learn" />
        </Box>
      </Stack>

      {/* Footer actions */}
      <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1, mt:2, pt:1, borderTop:'1px solid #232b36' }}>
        <Tooltip title="Add to list">
          <span>
            <Button form="skills-form" type="submit" variant="contained" size="small" startIcon={<AddIcon />} disabled={!!skillError || !skill.trim() || !categoryId}>Add</Button>
          </span>
        </Tooltip>
        <Tooltip title="Save changes to your skills">
          <Button type="button" color="success" variant="contained" size="small" startIcon={<SaveIcon />} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Tooltip>
      </Box>

      <Dialog
        open={editOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleEditClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Edit skill</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Skill name"
              value={editSkill}
              onChange={e => {
                const val = e.target.value;
                setEditSkill(val);
                setEditError(validateSkill(val.trim()));
              }}
              error={!!editError}
              helperText={editError || ' '}
              autoFocus
            />
            <FormControl size="small" error={!!editCategoryError}>
              <InputLabel>Category</InputLabel>
              <Select
                value={editCategoryId}
                label="Category"
                onChange={e => {
                  setEditCategoryId(e.target.value);
                  setEditCategoryError('');
                }}
              >
                {categories.map(c => (
                  <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
                ))}
              </Select>
              {editCategoryError && <FormHelperText>{editCategoryError}</FormHelperText>}
            </FormControl>
            {editMode === 'teach' ? (
              <FormControl size="small">
                <InputLabel>Level</InputLabel>
                <Select
                  value={editLevel}
                  label="Level"
                  onChange={e => setEditLevel(e.target.value)}
                >
                  {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info" variant="outlined">
                Learning skills don’t track level. Update the name or category and we’ll keep it fresh.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose} disabled={editSaving}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editSaving}>
            {editSaving ? 'Updating…' : 'Save' }
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2200}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
          onClose={handleSnackbarClose}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

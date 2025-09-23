import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { validateSkill } from '../utils/validation';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const API_BASE = 'http://localhost:5044';
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function SkillGroup({ title, list, onRemove, variant, categories, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ skill:'', level:'Beginner', categoryId:'' });

  const startEdit = (s) => {
    setEditingId(s.id||s.skill+ s.categoryId + s.level);
    setDraft({ skill: s.skill, level: s.level || 'Beginner', categoryId: s.categoryId });
  };
  const cancelEdit = () => { setEditingId(null); };
  const saveEdit = async (orig) => {
    await onUpdate(orig, draft, variant);
    setEditingId(null);
  };

  return (
    <div className="skill-panel">
      <div className="skill-panel-head">
        <h4>{title}</h4>
        <span className="count-pill">{list.length}</span>
      </div>
      <div className="skill-chip-wrap">
        {list.length === 0 && <div className="empty-hint">No skills yet</div>}
        {list.map(s => {
          const isEditing = editingId === (s.id||s.skill+ s.categoryId + s.level);
          return (
            <div key={(s.id||'') + s.skill + s.level} className={`skill-chip ${variant||''}`.trim()} style={isEditing?{borderColor:'var(--focus-ring)', boxShadow:'0 0 0 1px var(--focus-ring)'}:undefined}>
              {!isEditing && (
                <>
                  <div className="main">{s.skill}</div>
                  {s.level && s.level !== 'Any' && <span className="badge level">{s.level}</span>}
                  {s.categoryName && <span className="badge cat">{s.categoryName}</span>}
                  <div style={{display:'flex', gap:2}}>
                    <Tooltip title="Edit">
                      <IconButton size="small" className="remove-btn" onClick={()=>startEdit(s)} aria-label={`Edit ${s.skill}`}>
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" className="remove-btn" onClick={()=>onRemove(s)} aria-label={`Remove ${s.skill}`}>
                        <DeleteOutlineIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </>
              )}
              {isEditing && (
                <form onSubmit={e=>{e.preventDefault(); saveEdit(s);}} style={{display:'flex', flexDirection:'column', gap:4, minWidth:160}}>
                  <TextField size="small" value={draft.skill} onChange={e=>setDraft(d=>({...d, skill:e.target.value}))} label="Skill" />
                  {variant==='teach' && (
                    <FormControl size="small">
                      <InputLabel>Level</InputLabel>
                      <Select label="Level" value={draft.level} onChange={e=>setDraft(d=>({...d, level:e.target.value}))}>
                        {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                  <FormControl size="small">
                    <InputLabel>Category</InputLabel>
                    <Select label="Category" value={draft.categoryId} onChange={e=>setDraft(d=>({...d, categoryId:e.target.value}))}>
                      {categories.map(c => <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <div style={{display:'flex', gap:4, justifyContent:'flex-end'}}>
                    <IconButton size="small" color="success" type="submit" aria-label="Save"><CheckIcon fontSize="inherit" /></IconButton>
                    <IconButton size="small" color="error" onClick={cancelEdit} aria-label="Cancel"><CloseIcon fontSize="inherit" /></IconButton>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SkillEditor() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]); // {categoryId,name}
  const [categoriesMap, setCategoriesMap] = useState({});
  const [teach, setTeach] = useState([]);
  const [learn, setLearn] = useState([]);
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [mode, setMode] = useState('teach');
  const [categoryId, setCategoryId] = useState('');
  const [skillError, setSkillError] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE}/api/Categories/`)
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        const map = {};
        data.forEach(c => { map[c.categoryId] = c.name; });
        setCategoriesMap(map);
      })
      .catch(console.error);
  }, []);

  // Fetch user skills
  useEffect(() => {
    if (!currentUser?.id) return;
    refreshFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, categoriesMap]);

  // Helper: build lists from server response with de-duplication
  const buildLists = (data) => {
    const teachMap = new Map();
    const learnMap = new Map();
    data.forEach(d => {
      const id = d.userSkillId || d.UserSkillId || d.id; // tolerate different casings
      const skillName = d.skillName || d.SkillName;
      const entry = {
        id,
        skill: skillName,
        level: LEVELS[d.level] || LEVELS[d.Level] || 'Any',
        categoryId: d.categoryId || d.CategoryId,
        categoryName: (d.categoryName || d.CategoryName || categoriesMap[d.categoryId]) || ''
      };
      const key = (entry.skill + '|' + entry.categoryId).toLowerCase();
      if ((d.type === 0 || d.Type === 0)) {
        if (!teachMap.has(key)) teachMap.set(key, entry);
      } else {
        if (!learnMap.has(key)) learnMap.set(key, entry);
      }
    });
    setTeach(Array.from(teachMap.values()));
    setLearn(Array.from(learnMap.values()));
  };

  const refreshFromServer = () => {
    if (!currentUser?.id) return;
    fetch(`${API_BASE}/api/UserSkills/${currentUser.id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load skills'))
      .then(buildLists)
      .catch(err => console.error('Skill fetch error', err));
  };

  const add = () => {
    const trimmed = skill.trim();
    const err = validateSkill(trimmed);
    setSkillError(err);
    if (err || !categoryId) return;

    const entry = {
      skill: trimmed,
      level: mode === 'teach' ? level : 'Any',
      categoryId,
      categoryName: categoriesMap[categoryId] || ''
    };

    if (mode === 'teach') {
      if (!teach.some(s => s.skill.toLowerCase() === entry.skill.toLowerCase()))
        setTeach(prev => [...prev, entry]);
    } else {
      if (!learn.some(s => s.skill.toLowerCase() === entry.skill.toLowerCase()))
        setLearn(prev => [...prev, entry]);
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

  const updateSkill = async (orig, draft, variant) => {
    // local optimistic update
    const applyLocal = (arrSetter, arr, matcher) => arrSetter(arr.map(it => matcher(it) ? { ...it, skill:draft.skill.trim(), level: variant==='teach'? draft.level : 'Any', categoryId: draft.categoryId, categoryName: categoriesMap[draft.categoryId] || it.categoryName } : it));
    if (variant==='teach') applyLocal(setTeach, teach, it=>it===orig); else applyLocal(setLearn, learn, it=>it===orig);
    if (orig.id) {
      // send PUT
      await fetch(`${API_BASE}/api/UserSkills/${orig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          categoryId: Number(draft.categoryId),
          skillName: draft.skill.trim(),
          type: variant==='teach'? 0 : 1,
          level: variant==='teach'? LEVELS.indexOf(draft.level) : 0
        })
      }).catch(()=>{/* ignore errors for now */});
    }
  };

  const save = async () => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      const payloads = [];
      const combined = [
        ...teach.map(s => ({ ...s, type: 0 })),
        ...learn.map(s => ({ ...s, type: 1 }))
      ];
      for (const s of combined) {
        if (!s.id) {
          // Create new skill and capture returned id to avoid duplicate re-posts later
          payloads.push(
            fetch(`${API_BASE}/api/UserSkills/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id,
                categoryId: s.categoryId,
                skillName: s.skill,
                type: s.type,
                level: s.type === 0 ? LEVELS.indexOf(s.level) : 0
              })
            })
              .then(r => r.ok ? r.json() : Promise.reject('Create failed'))
              .then(res => {
                if (res && (res.userSkillId || res.UserSkillId)) {
                  s.id = res.userSkillId || res.UserSkillId; // mutate local reference
                }
              })
              .catch(err => console.error('Create skill error', err))
          );
        }
      }
      await Promise.all(payloads);
      // After saving, refetch authoritative list to (a) pick up ids (b) remove any possible duplicates
      refreshFromServer();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card skill-editor">
      <div className="skill-editor-head">
        <div className="title-block">
          <h3>Skills</h3>
          <p className="muted small">Add what you can teach and what you want to learn. This improves matching.</p>
        </div>
        <div className="counts">
          <div className="mini-metric"><span className="label">Teach</span><span className="value">{teach.length}</span></div>
          <div className="mini-metric"><span className="label">Learn</span><span className="value">{learn.length}</span></div>
        </div>
      </div>
      <div className="skill-editor-grid">
        <div className="entry-side">
          <div className="mode-toggle segmented">
            <button type="button" className={mode==='teach'? 'active':''} onClick={()=>setMode('teach')}>Teach</button>
            <button type="button" className={mode==='learn'? 'active':''} onClick={()=>setMode('learn')}>Learn</button>
          </div>
          <form className="skill-form" onSubmit={e=>{e.preventDefault(); add();}}>
            <TextField size="small" label={mode==='teach'? 'Skill you can teach':'Skill you want to learn'} value={skill} onChange={e=>setSkill(e.target.value)} error={!!skillError} helperText={skillError||' '} fullWidth />
            <div className="row two">
              <FormControl size="small" fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
                  {categories.map(c => <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              {mode==='teach' && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select label="Level" value={level} onChange={e=>setLevel(e.target.value)}>
                    {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </div>
            <div className="actions">
              <Button type="submit" variant="contained" size="small">Add</Button>
              <Button type="button" variant="outlined" size="small" disabled={saving} onClick={save}>{saving? 'Saving...':'Save'}</Button>
            </div>
          </form>
          <div className="tips muted small">Tip: Add specific frameworks or tools (e.g. React Hooks, Azure DevOps) to get more precise matches.</div>
        </div>
        <div className="lists-side">
          <SkillGroup title="Can Teach" list={teach} onRemove={removeTeach} variant="teach" categories={categories} onUpdate={updateSkill} />
          <SkillGroup title="Want to Learn" list={learn} onRemove={removeLearn} variant="learn" categories={categories} onUpdate={updateSkill} />
        </div>
      </div>
    </div>
  );
}

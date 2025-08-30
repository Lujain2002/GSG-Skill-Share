import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SKILL_CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Stack, Chip, Typography, Box, Alert } from '@mui/material';
import { validateSkill } from '../utils/validation';

const LEVELS = ['Beginner','Intermediate','Advanced','Expert'];

function SkillList({ title, list, onRemove }) {
  return (
    <Box sx={{mb:2}}>
      <Typography variant="subtitle2" sx={{mb:1}}>{title}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {list.length === 0 && <Typography variant="caption" color="text.secondary">None yet</Typography>}
        {list.map(s => (
          <Chip key={s.skill+s.level} label={`${s.skill}${s.level? ' · '+s.level:''}`} onDelete={()=>onRemove(s.skill)} size="small" color={title.includes('Teach')? 'primary':'default'} variant={title.includes('Teach')? 'filled':'outlined'} />
        ))}
      </Stack>
    </Box>
  );
}

export default function SkillEditor() {
  const { currentUser, updateSkills } = useAuth();
  const [teach,setTeach] = useState(currentUser.canTeach);
  const [learn,setLearn] = useState(currentUser.wantLearn);
  const [skill,setSkill] = useState('');
  const [level,setLevel] = useState('Beginner');
  const [mode,setMode] = useState('teach');
  const [category,setCategory] = useState(SKILL_CATEGORIES[0]);
  const [skillError,setSkillError] = useState('');
  const add = () => {
    const err = validateSkill(skill.trim());
    setSkillError(err);
    if (err) return;
    if (mode==='teach') {
      const entry = { skill: skill.trim(), level, category: category || DEFAULT_CATEGORY };
      if (!teach.some(s => s.skill.toLowerCase()===entry.skill.toLowerCase())) setTeach([...teach, entry]);
    } else {
      const entry = { skill: skill.trim(), level: 'Any', category: category || DEFAULT_CATEGORY };
      if (!learn.some(s => s.skill.toLowerCase()===entry.skill.toLowerCase())) setLearn([...learn, entry]);
    }
    setSkill('');
    setSkillError('');
  };
  const removeTeach = (s) => setTeach(teach.filter(x => x.skill!==s));
  const removeLearn = (s) => setLearn(learn.filter(x => x.skill!==s));
  const save = () => updateSkills(currentUser.id, { canTeach: teach, wantLearn: learn });
  return (
    <div className="card" style={{padding:'1.25rem 1.25rem 1.5rem'}}>
      <Typography variant="h6" sx={{mb:1}}>Skills</Typography>
      <Stack direction="row" spacing={1} sx={{mb:2}}>
        <Button size="small" variant={mode==='teach'? 'contained':'outlined'} onClick={()=>setMode('teach')}>Teach</Button>
        <Button size="small" variant={mode==='learn'? 'contained':'outlined'} onClick={()=>setMode('learn')}>Learn</Button>
      </Stack>
      <Box component="form" onSubmit={e=>{e.preventDefault(); add();}} sx={{display:'flex',flexWrap:'wrap',gap:1.2, mb:2}}>
        <TextField size="small" label={mode==='teach'? 'Skill you can teach':'Skill you want to learn'} value={skill} onChange={e=>setSkill(e.target.value)} error={!!skillError} helperText={skillError||' '} sx={{flex:'1 1 180px'}} />
        <FormControl size="small" sx={{minWidth:170}}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={category} onChange={e=>setCategory(e.target.value)}>
            {SKILL_CATEGORIES.concat([DEFAULT_CATEGORY]).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        {mode==='teach' && (
          <FormControl size="small" sx={{minWidth:150}}>
            <InputLabel>Level</InputLabel>
            <Select label="Level" value={level} onChange={e=>setLevel(e.target.value)}>
              {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        <Button type="submit" variant="contained" size="small">Add</Button>
        <Button type="button" variant="outlined" size="small" onClick={save}>Save</Button>
      </Box>
      <Stack direction={{xs:'column', sm:'row'}} spacing={2} useFlexGap>
        <Box sx={{flex:1}}>
          <SkillList title="Can Teach" list={teach} onRemove={removeTeach} />
        </Box>
        <Box sx={{flex:1}}>
          <SkillList title="Want to Learn" list={learn} onRemove={removeLearn} />
        </Box>
      </Stack>
    </div>
  );
}

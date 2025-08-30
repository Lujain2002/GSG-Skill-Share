import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, IconButton, Drawer, List, ListItemButton, ListItemText, Divider, Tooltip, Button, useMediaQuery, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PaletteIcon from '@mui/icons-material/Palette';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckIcon from '@mui/icons-material/Check';
import { useThemeSettings } from '../theme/ThemeProvider';
import SchoolIcon from '@mui/icons-material/School';

const TAB_LABELS = {
  dashboard: 'Dashboard',
  profile: 'Profile',
  skills: 'Skills',
  matches: 'Matches',
  sessions: 'Sessions',
  points: 'Points'
};

export default function NavBar({ active, onChange }) {
  const { currentUser, logout, updateProfile } = useAuth();
  const { settings, toggleMode, setPrimary, coreColors } = useThemeSettings();
  const [anchor,setAnchor] = useState(null);
  const tabs = Object.keys(TAB_LABELS);
  const [open,setOpen] = useState(false);
  const isSmall = useMediaQuery('(max-width:900px)');
  const activeIndex = tabs.indexOf(active);

  const handleTab = (_e, idx) => { if(idx > -1) onChange(tabs[idx]); };
  const drawer = (
    <Box sx={{width:250, p:2}} role="presentation" onClick={()=>setOpen(false)}>
      <Typography variant="h6" sx={{display:'flex',alignItems:'center',gap:1, mb:1}}><SchoolIcon fontSize="small"/> SkillShare</Typography>
      <Divider sx={{mb:1}} />
      <List>
        {tabs.map(t => (
          <ListItemButton key={t} selected={t===active} onClick={()=>onChange(t)}>
            <ListItemText primary={TAB_LABELS[t]} />
          </ListItemButton>
        ))}
      </List>
      {currentUser && <>
        <Divider sx={{my:1}} />
        <Typography variant="caption" color="text.secondary">{currentUser.name}<br/>Points: {currentUser.points}</Typography>
        <Button startIcon={<LogoutIcon />} variant="outlined" size="small" sx={{mt:1}} onClick={logout}>Logout</Button>
      </>}
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={4} sx={{background:'rgba(15,17,21,0.85)', backdropFilter:'blur(14px)'}}>
        <Toolbar variant="dense" sx={{gap:2}}>
          {isSmall && (
            <IconButton edge="start" color="inherit" onClick={()=>setOpen(true)} aria-label="menu">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{display:'flex',alignItems:'center',gap:1,fontSize:'1.05rem'}}><SchoolIcon fontSize="small"/> SkillShare</Typography>
          {!isSmall && (
            <Tabs value={activeIndex} onChange={handleTab} textColor="inherit" indicatorColor="primary" sx={{ml:2}}>
              {tabs.map(t => <Tab key={t} label={TAB_LABELS[t]} />)}
            </Tabs>
          )}
          <Box sx={{flexGrow:1}} />
          {currentUser && !isSmall && (
            <Box sx={{display:'flex',alignItems:'center',gap:1.5}}>
              <Tooltip title="Theme settings">
                <IconButton size="small" color="inherit" onClick={(e)=>setAnchor(e.currentTarget)} aria-label="theme">
                  <PaletteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle dark / light">
                <IconButton size="small" color="inherit" onClick={toggleMode} aria-label="mode">
                  {settings.mode==='dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Current points">
                <Typography variant="body2" sx={{fontSize:'.8rem',opacity:.8}}>{currentUser.name} · {currentUser.points} pts</Typography>
              </Tooltip>
              <IconButton size="small" color="inherit" onClick={logout} aria-label="logout">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {currentUser && isSmall && (
            <Box sx={{display:'flex',alignItems:'center',gap:1}}>
              <IconButton size="small" color="inherit" onClick={toggleMode} aria-label="mode">
                {settings.mode==='dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" color="inherit" onClick={(e)=>setAnchor(e.currentTarget)} aria-label="theme">
                <PaletteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" onClick={logout} aria-label="logout">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={()=>setAnchor(null)}>
        <Box sx={{display:'flex', gap:1, px:2, py:1.5}}>
          {coreColors.map(c => (
            <IconButton key={c} size="small" onClick={()=>{ setPrimary(c); setAnchor(null); }} sx={{background:c, '&:hover':{background:c}, color:'#fff', boxShadow: settings.primary===c ? '0 0 0 2px #fff inset':''}}>
              {settings.primary===c && <CheckIcon fontSize="small" />}
            </IconButton>
          ))}
        </Box>
        <MenuItem disabled sx={{fontSize:11, opacity:.7}}>Primary Color (auto-saved)</MenuItem>
      </Menu>
      <Drawer anchor="left" open={open} onClose={()=>setOpen(false)}>
        {drawer}
      </Drawer>
    </>
  );
}


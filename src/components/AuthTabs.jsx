import React, { useState } from 'react';
import { LoginForm, RegisterForm } from './AuthForms';
import { Tabs, Tab, Paper } from '@mui/material';

export default function AuthTabs() {
  const [tab,setTab] = useState(0);

  return (
    <div className="auth-tabs">
      <Paper elevation={6} sx={{background:'rgba(20,26,31,.55)', backdropFilter:'blur(14px)', mb:2, borderRadius:3}}>
        <Tabs value={tab} onChange={(e,v)=>setTab(v)} variant="fullWidth" textColor="inherit"
              TabIndicatorProps={{style:{height:3,borderRadius:2}}}>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
      </Paper>

      <div className="fade-area" style={{minHeight: '340px'}}>
        <div className={`fade-panel ${tab===0? 'active enter-left':''}`} aria-hidden={tab!==0}>
          <div className="card auth" role="tabpanel"><LoginForm compact /></div>
        </div>
        <div className={`fade-panel ${tab===1? 'active':''}`} aria-hidden={tab!==1}>
          <div className="card auth" role="tabpanel"><RegisterForm compact /></div>
        </div>
      </div>
    </div>
  );
}

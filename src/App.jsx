import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthTabs from './components/AuthTabs';
import NavBar from './components/NavBar';
import SkillEditor from './components/SkillEditor';
import Profile from './components/Profile';
import Matches from './components/Matches';
import Sessions from './components/Sessions';
import Points from './components/Points';
import Dashboard from './components/Dashboard';
import BookSessionModal from './components/BookSessionModal';
import Home from './components/Home';
import { Button } from '@mui/material';

function InnerApp() {
  const { currentUser } = useAuth();
  const [tab,setTab] = useState('dashboard');
  const [bookFor,setBookFor] = useState(null);
  const [authView, setAuthView] = useState('home');
  const [authTab, setAuthTab] = useState(0);

  const openAuth = (tabIndex = 0) => {
    setAuthTab(tabIndex);
    setAuthView('auth');
  };
  useEffect(() => {
    const handler = (e) => {
      const t = e?.detail?.tab;
      if (t) setTab(t);
    };
    window.addEventListener('navigateTab', handler);
    return () => window.removeEventListener('navigateTab', handler);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setAuthView('home');
      setAuthTab(0);
    }
  }, [currentUser]);

  if (!currentUser) {
    if (authView === 'home') {
      return <Home onStartSignup={() => openAuth(1)} onStartLogin={() => openAuth(0)} />;
    }
    return (
      <div className="container" style={{marginTop:'3rem', marginBottom:'4rem', maxWidth:'460px'}}>
        <Button variant="text" size="small" onClick={() => setAuthView('home')} sx={{mb:2}}>
          ← Back to home
        </Button>
        <h2 style={{textAlign:'center', marginBottom:'0.35rem'}}>Access your SkillShare account</h2>
        <p style={{textAlign:'center'}} className="muted">Log in to continue or create a new account.</p>
        <AuthTabs defaultTab={authTab} onTabChange={setAuthTab} />
      </div>
    );
  }
  return (
    <>
      <NavBar active={tab} onChange={setTab} />
      <div className="container">
  {tab==='dashboard' && <Dashboard />}
  {tab==='profile' && <Profile />}
        {tab==='skills' && <SkillEditor />}
        {tab==='matches' && <Matches onBook={(u)=>setBookFor(u)} />}
        {tab==='sessions' && <Sessions />}
        {tab==='points' && <Points />}
      </div>
      {bookFor && <BookSessionModal teacher={bookFor} onClose={()=>setBookFor(null)} />}
   
    </>
  );
}

export default function App() {
  return <AuthProvider><InnerApp /></AuthProvider>;
}

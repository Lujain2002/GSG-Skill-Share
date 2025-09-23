import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthTabs from './components/AuthTabs';
import NavBar from './components/NavBar';
import SkillEditor from './components/SkillEditor';
import Profile from './components/Profile';
import Matches from './components/Matches';
import Sessions from './components/Sessions';
import Points from './components/Points';
import Dashboard from './components/Dashboard';
import BookSessionModal from './components/BookSessionModal';

function InnerApp() {
  const { currentUser } = useAuth();
  const [tab,setTab] = useState('dashboard');

  // Load last tab per user when user changes
  // Key pattern: skillshare:lastTab:<userId>
  useEffect(() => {
    if (currentUser?.id) {
      const stored = localStorage.getItem(`skillshare:lastTab:${currentUser.id}`);
      if (stored) setTab(stored);
    }
  }, [currentUser?.id]);

  // Persist tab changes per user
  useEffect(() => {
    if (currentUser?.id && tab) {
      localStorage.setItem(`skillshare:lastTab:${currentUser.id}`, tab);
    }
  }, [tab, currentUser?.id]);
  const [bookFor,setBookFor] = useState(null);
  if (!currentUser) {
    return (
      <div className="container" style={{marginTop:'2.5rem'}}>
        <h1 style={{textAlign:'center'}}>SkillShare – Phase 1 Prototype</h1>
        <p style={{textAlign:'center'}} className="muted">Peer skill exchange with a points economy.</p>
        <AuthTabs />
     
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

export default function App() { return <InnerApp />; }

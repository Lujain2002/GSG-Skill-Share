import React, { useState } from 'react';
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

function InnerApp() {
  const { currentUser } = useAuth();
  const [tab,setTab] = useState('dashboard');
  const [bookFor,setBookFor] = useState(null);
  if (!currentUser) {
    return (
      <div className="container" style={{marginTop:'2.5rem'}}>
        <h1 style={{textAlign:'center'}}>SkillShare – Phase 1 Prototype</h1>
        <p style={{textAlign:'center'}} className="muted">Peer skill exchange with a points economy.</p>
        <AuthTabs />
        <div className="card" style={{marginTop:'1.5rem'}}>
          <h3>About (Demo)</h3>
          <p style={{fontSize:'.8rem',lineHeight:1.4}}>Local prototype. Data lives only in your browser (localStorage). Create multiple demo users to explore matching, booking and the points economy.</p>
          <ul style={{fontSize:'.75rem',lineHeight:1.4}}>
            <li>User mgmt: register / login</li>
            <li>Skills: manage teach & learn lists</li>
            <li>Matching: overlap scoring</li>
            <li>Points: earn teaching, spend booking</li>
            <li>Sessions: book · complete · cancel</li>
          </ul>
        </div>
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
